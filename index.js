const express = require("express");
const app = express();
const hb = require("express-handlebars");
const ca = require("chalk-animation");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// var cookieSession = require("cookie-session");
// app.use(
//     cookieSession({
//         secret: `signature setting`,
//         maxAge: 1000 * 60 * 60 * 24 * 14
//     })
// );
// app.use(require("cookie-parser")());

const db = require("./utils/db");

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
    });
});

app.post("/welcome", (req, res) => {
    console.log("req.body", req.body);
    db.addSignature(req.body.firstName, req.body.LastName, req.body.signature);
    res.redirect("/thankyou");
    db.getSigners();
    // res.cookie("signature image", req.body.signature);
});

// Rendering the page and handling requests from the thank you page

app.get("/thankyou", (req, res) => {
    list.then(function(list) {
        console.log("this is my list count: ", list.rowCount);
        res.render("thankyou", {
            layout: "main",
            title: "Thank you for signing!",
            signatureURL: "",
            supporters: list.rowCount
        });
    });
});

app.post("/thankyou", (req, res) => {
    res.redirect("/signers");
    console.log("thank you post being received");
});

// Rendering the page and handling requests from the signers page

app.get("/signers", (req, res) => {
    list.then(function(list) {
        console.log("this is list of signers: ", list.rows);
        res.render("signers", {
            layout: "main",
            title: "Look who has already signed!",
            list: list.rows
        });
    });
});

app.listen(8080, () => ca.neon("Here for you, hon! Hit me!"));
