const spicedPg = require("spiced-pg");
let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg(`postgres:postgres:postgres@localhost:5432/signatures`);
}

exports.addSignature = function addSignature(first_name, last_name, signature) {
    // console.log("db addSignature works");
    return db.query(
        "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id ",
        [first_name, last_name, signature]
    );
};

exports.getList = function getList() {
    // console.log("db list of signers");
    return db.query("SELECT first, last FROM users");
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
