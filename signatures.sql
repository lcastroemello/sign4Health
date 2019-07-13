

------------Table with data from registered users-------
DROP TABLE IF EXISTS users CASCADE;
--
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR (255) NOT NULL CHECK (first <> ''),
    last VARCHAR (255) NOT NULL CHECK (last <> ''),
    email VARCHAR (255) NOT NULL CHECK (email <> '') UNIQUE,
    password_digest VARCHAR (255) NOT NULL CHECK (password_digest <> ''),
    date_and_time TIMESTAMP
);
SELECT * FROM users;


------------ Table to colect signatures--------
DROP TABLE IF EXISTS signatures;
--
CREATE TABLE signatures (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) UNIQUE,
signature TEXT NOT NULL,
date_and_time TIMESTAMP
);

SELECT * FROM signatures;


-----------Extra data on users--------------

DROP TABLE IF EXISTS user_profiles;
--
CREATE TABLE user_profiles (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) UNIQUE,
age INTEGER,
city VARCHAR(255),
url VARCHAR(1000)
);
SELECT * FROM user_profiles;
