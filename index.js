const express = require("express");
const app = (exports.app = express());
const hb = require("express-handlebars");
const ca = require("chalk-animation");
const db = require("./utils/db");
const bcrypt = require("bcryptjs");
const csurf = require("csurf");
const secrets = require("./secrets");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

var cookieSession = require("cookie-session");

app.use(express.static("./static"));
app.use(
    cookieSession({
        secret: secrets.SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(csurf());
app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// app.use(function(req, res, next) {
//     res.set("x-frame-options", "deny").next();
// });

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

//-----------------middlewares (user routes) --------

const {
    notLoggedIn,
    requireSignature,
    loggedIn
} = require("./utils/middleware");

//------------------/route--------------------

// Redirecting users from / to the welcome page
app.get("/", (req, res) => {
    res.redirect("/welcome");
});

// ------------WELCOME / REGISTER ---------

app.get("/welcome", loggedIn, (req, res) => {
    res.render("welcome", {
        layout: "main",
        title: "Register for global health!",
        loglink: "/login",
        logbutton: "LOGIN",
        about: "/about",
        abouttext: "ABOUT"
    }); //end of render welcome
}); //end of app.get welcome

app.post("/welcome", loggedIn, (req, res) => {
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
                    "Ups! Something went wrong! 😧 Try again (remember all fields are mandatory)",
                loglink: "/login",
                logbutton: "LOGIN",
                about: "/about",
                abouttext: "ABOUT"
            }); //end render
        }); //end of promise chain
}); //end of app.post welcome

//--------------ABOUT----------------------
app.get("/about", (req, res) => {
    if (!req.session.userId && !req.session.signId) {
        res.render("about", {
            layout: "main",
            title: "Why to sign?",
            loglink: "/welcome",
            logbutton: "REGISTER",
            about: "/login",
            abouttext: "LOGIN"
            // type: "hidden"
        });
    } else {
        res.render("about", {
            layout: "main",
            title: "Why to sign?",
            loglink: "/welcome",
            logbutton: "REGISTER",
            about: "/logout",
            abouttext: "LOGOUT"
        });
    }
});

//--------------USER INFO-------------------

app.get("/userinfo", requireSignature, loggedIn, (req, res) => {
    res.render("userinfo", {
        layout: "main",
        title: "Let us know more about you",
        loglink: "/about",
        logbutton: "ABOUT"
    }); //end of render
}); // end of get userinfo

app.post("/userinfo", requireSignature, loggedIn, (req, res) => {
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
                res.redirect("/signature");
            })
            .catch(err => {
                console.log("error on add user: ", err.message);
                res.render("userinfo", {
                    layout: "main",
                    title: "Oh no!",
                    loglink: "/about",
                    logbutton: "ABOUT",
                    error: "Ups! Something went wrong! 😧 Try again"
                }); //end of render
            });
    } //end of promise chain
}); //end of post userinfo

//------------SIGNATURE------------------------
app.get("/signature", notLoggedIn, (req, res) => {
    db.getUsername(req.session.userId).then(info => {
        res.render("signature", {
            layout: "main",
            title: "Sign here!",
            loglink: "/logout",
            logbutton: "LOGOUT",
            about: "/about",
            abouttext: "ABOUT",
            username: info.rows[0].first
        });
    }); //end promise chain
}); //end get signature

app.post("/signature", notLoggedIn, (req, res) => {
    db.addSignature(req.body.signature, req.session.userId)
        .then(data => {
            req.session.signId = data.rows[0].id;
            res.redirect("/thankyou");
        })
        .catch(err => {
            console.log(err);
            db.getUsername(req.session.userId).then(info => {
                res.render("signature", {
                    layout: "main",
                    title: "Oh no!",
                    username: info.rows[0].first,
                    loglink: "/logout",
                    logbutton: "LOGOUT",
                    about: "/about",
                    abouttext: "ABOUT",
                    error: "Ups! Something went wrong! 😧 Try again"
                }); //end render
            });
        }); //end promise chain
}); //end post signature

//-------------THANK YOU-----------------------

app.get("/thankyou", notLoggedIn, requireSignature, (req, res) => {
    db.getList().then(data => {
        db.getSignature(req.session.userId)
            .then(info => {
                res.render("thankyou", {
                    layout: "main",
                    title: "Thank you for signing!",
                    loglink: "/logout",
                    logbutton: "LOGOUT",
                    about: "/about",
                    abouttext: "ABOUT",
                    signatureURL: info.rows[0].signature,
                    supporters: data.rowCount + 1
                });
            })
            .catch(err => {
                console.log(err);
            }); //end promises chain
    });
}); //end app get thank you

app.post("/thankyou", notLoggedIn, requireSignature, (req, res) => {
    res.redirect("/signers");
}); //end post thank you

//--------------SIGNERS LIST -------------------

app.get("/signers", notLoggedIn, requireSignature, loggedIn, (req, res) => {
    db.fullDataList(req.session.userId)
        .then(list => {
            console.log("testing signers list ", list);
            res.render("signers", {
                layout: "main",
                title: "Look who has already signed!",
                list: list.rows,
                loglink: "/logout",
                logbutton: "LOGOUT",
                about: "/about",
                abouttext: "ABOUT"
            });
        })
        .catch(err => {
            console.log(err);
        }); //end promise chain
}); //end get signers

app.get("/signers/:city", notLoggedIn, (req, res) => {
    db.cityList(req.params.city.toLowerCase()).then(list => {
        res.render("citylist", {
            city: req.params.city,
            list: list.rows,
            loglink: "/logout",
            logbutton: "LOGOUT",
            about: "/about",
            abouttext: "ABOUT"
        });
    });
});
//--------------LOGIN PAGE-----------------------

app.get("/login", requireSignature, loggedIn, (req, res) => {
    res.render("login", {
        layout: "main",
        title: "Login",
        loglink: "/welcome",
        logbutton: "REGISTER",
        about: "/about",
        abouttext: "ABOUT"
    });
}); // end get login

app.post("/login", requireSignature, loggedIn, (req, res) => {
    db.getUserByEmail(req.body.email)
        .then(data => {
            if (!data.rows[0]) {
                res.render("login", {
                    layout: "main",
                    title: "Oh no!",
                    loglink: "/welcome",
                    logbutton: "REGISTER",
                    about: "/about",
                    abouttext: "ABOUT",
                    error:
                        "Ups! Something went wrong! 😧 Are you sure you have already registered in our petition? Try again"
                });
            } else {
                checkPassword(req.body.password, data.rows[0].password_digest)
                    .then(boolean => {
                        if (boolean) {
                            req.session.userId = data.rows[0].id;
                            db.getsignId(data.rows[0].id)
                                .then(signid => {
                                    if (signid) {
                                        console.log(
                                            "testing sign id cookie",
                                            signid.rows[0].id
                                        );
                                        req.session.signId = signid.rows[0].id;
                                    } else {
                                        console.log(
                                            "i put this to make it work"
                                        );
                                    }
                                    res.redirect("/thankyou");
                                })
                                .catch(err => {
                                    console.log(err);
                                });
                        } else {
                            res.render("login", {
                                layout: "main",
                                title: "Oh no!",
                                loglink: "/welcome",
                                logbutton: "REGISTER",
                                about: "/about",
                                abouttext: "ABOUT",
                                error:
                                    "Oh no! 😧 Your email and password are not a match 💔 Try again"
                            }); //end render login no match
                        } //end inner else
                    })
                    .catch(err => {
                        console.log(err);
                    }); //end inner else promise chain
            }
        })
        .catch(err => {
            console.log(err);
            res.render("login", {
                layout: "main",
                title: "Oh no!",
                loglink: "/welcome",
                logbutton: "REGISTER",
                about: "/about",
                abouttext: "ABOUT",
                error: "Ups! Something went wrong! 😧  Try again"
            }); //end render error
        }); //end outer promise chain
}); // end app.post login

//--------------PERSONAL PROFILE PAGE------------

app.get("/myprofile", notLoggedIn, requireSignature, loggedIn, (req, res) => {
    db.getUserRegInfo(req.session.userId)
        .then(info => {
            db.getUserInfo(req.session.userId).then(extra => {
                res.render("myprofile", {
                    layout: "main",
                    title: "Welcome back " + info.rows[0].first,
                    first: info.rows[0].first,
                    last: info.rows[0].last,
                    email: info.rows[0].email,
                    age: extra.rows[0] ? extra.rows[0].age : "",
                    city: extra.rows[0] ? extra.rows[0].city : "",
                    homepage: extra.rows[0] ? extra.rows[0].url : "",
                    loglink: "/logout",
                    logbutton: "LOGOUT",
                    about: "/about",
                    abouttext: "ABOUT"
                }); //end render myprofile
            });
        })
        .catch(err => {
            console.log(err);
        });
});

app.post("/myprofile", notLoggedIn, requireSignature, loggedIn, (req, res) => {
    db.getUserRegInfo(req.session.userId).then(info => {
        db.getUserInfo(req.session.userId).then(extra => {
            db.updateUserInfo(
                req.body.age,
                req.body.city,
                req.body.homepage,
                req.session.userId
            )
                .then(data => {
                    if (req.body.password != "") {
                        return hashPassword(req.body.password);
                    } else {
                        return info.rows[0].password_digest;
                    }
                })
                .then(hash => {
                    db.updateUsers(
                        req.body.firstName || info.rows[0].first,
                        req.body.lastName || info.rows[0].last,
                        req.body.email || info.rows[0].email,
                        hash,
                        req.session.userId
                    );
                    // res.alert("Profile updated successfully!");
                    res.redirect("/signers");
                })
                .catch(err => {
                    console.log(err);
                    db.getUserRegInfo(req.session.userId).then(info => {
                        db.getUserInfo(req.session.userId).then(extra => {
                            res.render("myprofile", {
                                layout: "main",
                                title: "Welcome back " + info.rows[0].first,
                                first: info.rows[0].first,
                                last: info.rows[0].last,
                                email: info.rows[0].email,
                                age: extra.rows[0].age,
                                city: extra.rows[0].city,
                                homepage: extra.rows[0].url,
                                loglink: "/logout",
                                logbutton: "LOGOUT",
                                about: "/about",
                                abouttext: "ABOUT",
                                error:
                                    "Ups! Something went wrong! 😧  Try again"
                            }); //end render myprofile
                        });
                    });
                });
        });
    });
});

//-------------Logout page-------------------------
app.get("/logout", notLoggedIn, (req, res) => {
    req.session = null;
    res.redirect("/welcome");
});

//--------------Let's get that server running!------------------------------

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => {
        ca.neon("Here for you, hon! Hit me!");
    });
}
