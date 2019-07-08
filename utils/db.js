const spicedPg = require("spiced-pg");

var db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

exports.getSigners = function getSigners() {
    console.log("getSigners works");
    return db.query("SELECT * FROM signatures");
};

exports.addSignature = function addSignature(first_name, last_name, signature) {
    console.log("addSignature works");
    return db.query(
        "INSERT INTO signatures (first, last, signature, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)",
        [first_name, last_name, signature]
    );
};
