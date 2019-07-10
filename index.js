const express = require("express");
const app = express();
const hb = require("express-handlebars");
const ca = require("chalk-animation");
const db = require("./utils/db");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
var cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: `It's gonna be ok`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
app.use(require("cookie-parser")());
app.use(express.static("./static"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// getting our list of signers from the db
let list = db.getList();
// Redirecting users from / to the welcome page
app.get("/", (req, res) => {
    res.redirect("/welcome");
});

// Rendering the page and handling requests from the welcome page
app.get("/welcome", (req, res) => {
    res.render("welcome", {
        layout: "main",
        title: "Sign here for global health!"
    }); //end of render welcome
}); //end of app.get welcome

app.post("/welcome", (req, res) => {
    let addSignature = db.addSignature(
        req.body.firstName,
        req.body.LastName,
        req.body.signature
    ); //end addSignature
    addSignature
        .then(function(addSignature) {
            console.log("user id", addSignature.rows[0].id);
            res.session.signed = addSignature.rows[0].id;
        })
        .then(function() {
            res.redirect("/thankyou");
        })
        .catch(err => {
            console.log(err);
            res.render("welcome", {
                layout: "main",
                title: "Sign here for global health!",
                error:
                    "Ups! Something went wrong! 😧 Try again (remember that we need your first name, last name and signature for your support to be registered)
            });
        }); //end of catch err
}); //end of app.post welcome

// Rendering the page and handling requests from the thank you page

app.get("/thankyou", (req, res) => {
    list.then(function(list) {
        // getSignature.then(function(getSignature) {
        res.render("thankyou", {
            layout: "main",
            title: "Thank you for signing!",
            signatureURL: "",
            supporters: list.rowCount + 1
        });
        //     });
        // }).catch(err => {
        //     console.log(err);
    });
});

app.post("/thankyou", (req, res) => {
    res.redirect("/signers");
    console.log("thank you post being received");
});

// Rendering the page and handling requests from the signers page

app.get("/signers", (req, res) => {
    list.then(function(list) {
        // console.log("this is list of signers: ", list.rows);
        res.render("signers", {
            layout: "main",
            title: "Look who has already signed!",
            list: list.rows
        });
    }).catch(err => {
        console.log(err);
    });
});

app.listen(process.env.PORT || 8080, () => ca.neon("Here for you, hon! Hit me!"));
