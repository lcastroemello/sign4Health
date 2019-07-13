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
        [user_id, age, city, url]
    );
};

//
//-----------GETTING info from tables-------------
//

exports.getList = function getList() {
    // console.log("db list of signers");
    return db.query("SELECT first, last FROM users");
};

exports.getUserRegInfo = function(id) {
    return db.query("SELECT * FROM users WHERE id=$1", [id]);
};

exports.getUserInfo = function(user_id) {
    return db.query("SELECT * FROM user_profiles WHERE user_id=$1", [user_id]);
};

exports.getUsername = function getUsername(id_number) {
    return db.query("SELECT first FROM users WHERE id=$1", [id_number]);
};

exports.getSignature = function getSignature(user_id) {
    console.log("get signature db works");
    return db.query("SELECT signature FROM signatures WHERE user_id=$1", [
        user_id
    ]);
};

exports.getUserByEmail = function getUserbyEmail(email) {
    return db.query("SELECT * FROM users WHERE email=$1", [email]);
};

exports.getsignId = function(user_id) {
    return db.query("SELECT id FROM signatures WHERE user_id=$1", [user_id]);
};

exports.fullDataList = function() {
    return db.query(
        "SELECT first, last, age, city, url FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id"
    );
};

exports.cityList = function(city) {
    return db.query(
        "SELECT first, last, age, url FROM users FULL OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(user_profiles.city)=$1",
        [city]
    );
};

//----------UPDATING TABLES-------------

exports.updateUsers = function(first, last, email, pass, id) {
    return db.query(
        "UPDATE users SET first= $1, last= $2, email= $3, password_digest= $4  WHERE id= $5",
        [first, last, email, pass, id]
    );
};

exports.updateUserInfo = function(age, city, url, user_id) {
    return db.query(
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age=$1, city=$2, url=$3",
        [age || null, city || null, url || null, user_id]
    );
};
