------------ Table to colect signatures--------
DROP TABLE IF EXISTS signatures;
--
CREATE TABLE signatures (
id SERIAL PRIMARY KEY,
user_id INTEGER,
signature TEXT NOT NULL,
date_and_time TIMESTAMP
);

SELECT * FROM signatures;

------------Table with data from registered users-------
DROP TABLE IF EXISTS users;
--
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR (255) NOT NULL CHECK (first <> ''),
    last VARCHAR (255) NOT NULL CHECK (last <> ''),
    email VARCHAR (255) NOT NULL CHECK (email <> ''),
    password_digest VARCHAR (255) NOT NULL CHECK (password_digest <> ''),
    date_and_time TIMESTAMP
);
SELECT * FROM users;
