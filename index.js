const express = require("express");
const app = express();
const hb = require("express-handlebars");
const ca = require("chalk-animation");
const db = require("./utils/db");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
var cookieSession = require("cookie-session");
app.use(require("cookie-parser")());
app.use(express.static("./static"));
app.use(
    cookieSession({
        secret: "its gonna bew ok",
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
// app.use(require("secrets.json"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// Redirecting users from / to the welcome page
app.get("/", (req, res) => {
    res.redirect("/welcome");
});

// ------------WELCOME / REGISTER ---------

app.get("/welcome", (req, res) => {
    res.render("welcome", {
        layout: "main",
        title: "Register for global health!"
    }); //end of render welcome
}); //end of app.get welcome

app.post("/welcome", (req, res) => {
    console.log("this is body at this point: ", req.body);
    db.addUser(
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        req.body.password
    )
        .then(data => {
            console.log("data add signature ", data.rows[0]);
            req.session.userId = data.rows[0].id;
            res.redirect("/userinfo");
        })
        .catch(err => {
            console.log(err);
            res.render("welcome", {
                layout: "main",
                title: "Sign here for global health!",
                error:
                    "Ups! Something went wrong! 😧 Try again (remember all fields are mandatory)"
            }); //end render
        }); //end of promise chain
}); //end of app.post welcome

//--------------USER INFO-------------------

app.get("/userinfo", (req, res) => {
    res.render("userinfo", {
        layout: "main",
        title: "Let us know more about you"
    }); //end of render
}); // end of get userinfo

app.post("/userinfo", (req, res) => {
    console.log("body in userinfo ", req.body);
    db.addUserInfo(
        req.session.userId,
        req.body.age,
        req.body.city,
        req.body.homepage
    )
        .then(info => {
            req.session.userInfoId = info.rows[0].id;
            res.redirect("/signature");
        })
        .catch(err => {
            console.log(err);
            res.render("userinfo", {
                layout: "main",
                title: "Let us know more about you",
                error: "Ups! Something went wrong! 😧 Try again"
            }); //end of render
        }); //end of promise chain
}); //end of post userinfo

//------------SIGNATURE------------------------
app.get("/signature", (req, res) => {
    db.getUsername(req.session.userId).then(info => {
        res.render("signature", {
            layout: "main",
            title: "Sign here!",
            username: info.rows[0].first
        });
    }); //end promise chain
}); //end get signature

app.post("/signature", (req, res) => {
    console.log("this is my user-id cookie: ", req.session.signId);
    db.addSignature(req.body.signature, req.session.signId)
        .then(data => {
            console.log("this is data at signature", data);
            req.session.signId = data.rows[0].id;
            req.session.logIn = true;
            res.redirect("/thankyou");
        })
        .catch(err => {
            console.log(err);
            db.getUsername(req.session.signId).then(info => {
                res.render("signature", {
                    layout: "main",
                    title: "Sign here!",
                    username: info.rows[0].first,
                    error: "Ups! Something went wrong! 😧 Try again"
                }); //end render
            });
        }); //end promise chain
}); //end post signature

//-------------THANK YOU-----------------------

// getting our list of signers from the db
let list = db.getList();

app.get("/thankyou", (req, res) => {
    list.then(data => {
        db.getSignature(req.session.signId)
            .then(info => {
                res.render("thankyou", {
                    layout: "main",
                    title: "Thank you for signing!",
                    signatureURL: info.rows[0].signature,
                    supporters: data.rowCount + 1
                });
            })
            .catch(err => {
                console.log(err);
            }); //end promises chain
    });
}); //end app get thank you

app.post("/thankyou", (req, res) => {
    res.redirect("/signers");
    console.log("thank you post being received");
}); //end post thank you

//--------------SIGNERS LIST -------------------

app.get("/signers", (req, res) => {
    list.then(list => {
        // console.log("this is list of signers: ", list.rows);
        res.render("signers", {
            layout: "main",
            title: "Look who has already signed!",
            list: list.rows
        });
    }).catch(err => {
        console.log(err);
    }); //end promise chain
}); //end get signers

//--------------LOGIN PAGE-----------------------
//--------------PERSONAL PROFILE PAGE------------

app.listen(process.env.PORT || 8080, () =>
    ca.neon("Here for you, hon! Hit me!")
);
