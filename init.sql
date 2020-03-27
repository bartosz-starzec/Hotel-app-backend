CREATE TABLE rooms (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(25) NOT NULL,
  description VARCHAR(255) NOT NULL,
  equipment VARCHAR(255) NOT NULL,
  image TEXT,
  size INT,
  price DECIMAL (6,2)
);

CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  token VARCHAR(300) DEFAULT NULL,
  username VARCHAR(50) NOT NULL,
  role VARCHAR(10),
  password VARCHAR(150),
  name VARCHAR(25) DEFAULT '',
  surname VARCHAR(50) DEFAULT '',
  street VARCHAR(25) DEFAULT '',
  city VARCHAR(25) DEFAULT '',
  postalCode VARCHAR(25) DEFAULT ''
);

CREATE TABLE reservations (
  ID SERIAL PRIMARY KEY,
  roomId INT NOT NULL references rooms(ID),
  userId INT NOT NULL references users(ID),
  name VARCHAR(50),
  surname VARCHAR(50),
  street VARCHAR(25),
  city VARCHAR(25),
  postalCode VARCHAR(10),
  startDate DATE,
  endDate DATE,
  days INT
);

INSERT INTO users (username, role, password)
VALUES ('admin', 'admin', 'admin');
