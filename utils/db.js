const spicedPg = require("spiced-pg");

var db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");

exports.addSignature = function addSignature(first_name, last_name, signature) {
    console.log("addSignature works");
    return db.query(
        "INSERT INTO signatures (first, last, signature, date_and_time) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)",
        [first_name, last_name, signature]
    );
};

exports.getList = function getList() {
    console.log("this is the list of signers");
    return db.query("SELECT first, last FROM signatures");
};
