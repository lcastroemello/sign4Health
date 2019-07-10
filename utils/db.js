const spicedPg = require("spiced-pg");

if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg(`postgres:postgres:postgres@localhost:5432/signatures`);
}

exports.addSignature = function addSignature(first_name, last_name, signature) {
    // console.log("db addSignature works");
    return db.query(
        "INSERT INTO signatures (first, last, signature, date_and_time) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id ",
        [first_name, last_name, signature]
    );
};

exports.getList = function getList() {
    // console.log("db list of signers");
    return db.query("SELECT first, last FROM signatures");
};

//NEVER DO THAT - VULNERABLE TO INSERTION
// exports.getID = function getID(first_name, last_name) {
//     console.log("get ID db works");
//     return db.query(
//         "SELECT id FROM signatures WHERE first='" +
//             first_name +
//             "'AND '" +
//             last_name +
//             "'"
//     );
// };

exports.getSignature = function getSignature(id_number) {
    console.log("get signature db works");
    return db.query(
        "SELECT signature FROM signatures WHERE id='" + id_number + "'"
    );
};
