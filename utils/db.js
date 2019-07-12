const spicedPg = require("spiced-pg");
let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg(`postgres:postgres:postgres@localhost:5432/signatures`);
}

//
//-------ADDING info to tables-------------
//

exports.addUser = function addUser(first_name, last_name, email, password) {
    // console.log("db addSignature works");
    return db.query(
        "INSERT INTO users (first, last, email, password_digest) VALUES ($1, $2, $3, $4) RETURNING id",
        [first_name, last_name, email, password]
    );
};

exports.addSignature = function addSignature(signature, user_id) {
    return db.query(
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id",
        [signature, user_id]
    );
};

exports.addUserInfo = function addUserInfo(user_id, age, city, url) {
    return db.query(
        "INSERT INTO user_profiles (user_id, age, city, url) VALUES ($1, $2, $3, $4) RETURNING id",
        [user_id || null, age || null, city || null, url || null]
    );
};

//
//-----------GETTING info from tables-------------
//

exports.getList = function getList() {
    // console.log("db list of signers");
    return db.query("SELECT first, last FROM users");
};

exports.getUsername = function getUsername(id_number) {
    return db.query("SELECT first FROM users WHERE id=$1", [id_number]);
};

exports.getSignature = function getSignature(id_number) {
    console.log("get signature db works");
    return db.query(`SELECT signature FROM signatures WHERE id=$1`, [
        id_number
    ]);
};

exports.getUserByEmail = function getUserbyEmail(email) {
    return db.query("SELECT * FROM users WHERE email=$1", [email]);
};
