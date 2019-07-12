const express = require("express");
const app = (exports.app = express());
const hb = require("express-handlebars");
const ca = require("chalk-animation");
const db = require("./utils/db");
const bcrypt = require("bcryptjs");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

var cookieSession = require("cookie-session");
// app.use(require("cookie-parser")());
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

//---------------BCRYPT functions-----------------
function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}

//------------------/route--------------------

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
    hashPassword(req.body.password)
        .then(hash => {
            return db
                .addUser(
                    req.body.firstName,
                    req.body.lastName,
                    req.body.email,
                    hash
                )
                .then(data => {
                    // console.log("data add user ", data);
                    req.session.userId = data.rows[0].id;
                    res.redirect("/userinfo");
                });
        })
        .catch(err => {
            console.log("welcome post err", err);
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
    if (req.body.age == "" && req.body.city == "" && req.body.homepage == "") {
        res.redirect("/signature");
    } else {
        console.log(req.session);
        db.addUserInfo(
            req.session.userId,
            req.body.age || null,
            req.body.city || null,
            req.body.homepage || null
        )
            .then(info => {
                req.session.userInfoId = info.rows[0].id;
                req.session.loggedIn = true;
                res.redirect("/signature");
            })
            .catch(err => {
                console.log("error on add user: ", err.message);
                res.render("userinfo", {
                    layout: "main",
                    title: "Oh no!",
                    error: "Ups! Something went wrong! 😧 Try again"
                }); //end of render
            });
    } //end of promise chain
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
    console.log("this is signature body", req.body);
    console.log("this is req.session", req.session);
    db.addSignature(req.body.signature, req.session.userId)
        .then(data => {
            req.session.signId = data.rows[0].id;
            res.redirect("/thankyou");
        })
        .catch(err => {
            console.log(err);
            db.getUsername(req.session.signId).then(info => {
                res.render("signature", {
                    layout: "main",
                    title: "Oh no!",
                    username: info.rows[0].first,
                    error: "Ups! Something went wrong! 😧 Try again"
                }); //end render
            });
        }); //end promise chain
}); //end post signature

//-------------THANK YOU-----------------------

app.get("/thankyou", (req, res) => {
    db.getList().then(data => {
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
}); //end post thank you

//--------------SIGNERS LIST -------------------

app.get("/signers", (req, res) => {
    db.getList()
        .then(list => {
            res.render("signers", {
                layout: "main",
                title: "Look who has already signed!",
                list: list.rows
            });
        })
        .catch(err => {
            console.log(err);
        }); //end promise chain
}); //end get signers

//--------------LOGIN PAGE-----------------------

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        title: "Login"
    });
}); // end get login

app.post("/login", (req, res) => {
    db.getUserByEmail(req.body.email)
        .then(data => {
            if (!data.rows[0]) {
                res.render("login", {
                    layout: "main",
                    title: "Oh no!",
                    error:
                        "Ups! Something went wrong! 😧 Are you sure you have already registered in our petition? Try again"
                }); //end render login not registered
            } else {
                checkPassword(
                    req.body.password,
                    data.rows[0].password_digest
                ).then(boolean => {
                    if (boolean) {
                        req.session.loggedIn = true;
                        req.session.userId = data.rows[0].id;
                        res.redirect("/myprofile");
                    } else {
                        res.render("login", {
                            layout: "main",
                            title: "Oh no!",
                            error:
                                "Oh no! 😧 Your email and password are not a match 💔 Try again"
                        }); //end render login no match
                    } //end inner else
                }); //end outer else promise chain
            }
        })
        .catch(err => {
            console.log(err);
            res.render("login", {
                layout: "main",
                title: "Oh no!",
                error: "Ups! Something went wrong! 😧  Try again"
            }); //end render error
        }); //end outer promise chain
}); // end app.post login

//--------------PERSONAL PROFILE PAGE------------
app.get("/myprofile", (req, res) => {
    db.getUserRegInfo(req.session.userId)
        .then(info => {
            db.getUserInfo(req.session.userId).then(extra => {
                res.render("myprofile", {
                    layout: "main",
                    title: "Welcome back" + info.rows[0].first,
                    firstName: info.rows[0].first,
                    age: extra.rows[0].age,
                    city: extra.rows[0].city,
                    homepage: extra.rows[0].url
                }); //end render myprofile
            });
        })
        .catch(err => {
            console.log(err);
        });
});

//-------------Logout page-------------------------
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/welcome");
});

//--------------Let's get that server running!------------------------------

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => {
        ca.neon("Here for you, hon! Hit me!");
    });
}
