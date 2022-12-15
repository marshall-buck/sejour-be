-- DROP TABLE IF EXISTS images;
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS properties;
-- DROP TABLE IF EXISTS users;
CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  avatar TEXT NOT NULL DEFAULT 'https://picsum.photos/100'
);

CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(30) NOT NULL,
  state VARCHAR(30) NOT NULL,
  zipcode VARCHAR(11) NOT NULL,
  latitude VARCHAR(14) NOT NULL,
  longitude VARCHAR(14) NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  owner_username VARCHAR(25) NOT NULL REFERENCES users ON DELETE CASCADE,
  archived BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  property_id INT NOT NULL REFERENCES properties ON DELETE CASCADE,
  guest_username VARCHAR(25) NOT NULL REFERENCES users ON DELETE CASCADE
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_username TEXT NOT NULL REFERENCES users,
  to_username TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  property_id INT NOT NULL REFERENCES properties ON DELETE CASCADE
);