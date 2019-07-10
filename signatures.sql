-- ////////DO NOT UNCOMMENT THIS, IT RESETS THE TABLE /////////////

DROP TABLE IF EXISTS signatures;
--
CREATE TABLE signatures (
id SERIAL PRIMARY KEY,
first VARCHAR (255) NOT NULL CHECK (first <> ''),
last VARCHAR (255) NOT NULL CHECK (last <> ''),
signature TEXT NOT NULL,
date_and_time TIMESTAMP
);
--
-- -- //////////////////////////////////////////////////
SELECT * FROM signatures;

-- SELECT first, last FROM signatures
