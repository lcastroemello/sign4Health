const express = require("express");
const app = express();
const hb = require("express-handlebars");
const ca = require("chalk-animation");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const db = require("./utils/db");

app.use(express.static("./static"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

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
    // res.redirect("/thankyou");
    db.getSigners();
});

// Rendering the page and handling requests from the thank you page

app.get("/thankyou", (req, res) => {
    res.render("thankyou", {
        layout: "main",
        title: "Thank you for signing!"
    });
});

app.post("/thankyou", (req, res) => {
    res.redirect("/signers");
});

app.get("/signers", (req, res) => {
    res.render("signers", {
        layout: "main",
        title: "Look who already signed!"
    });
});

app.listen(8080, () => ca.neon("Here for you, hon! Hit me!"));
