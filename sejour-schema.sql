-- DROP TABLE IF EXISTS images;
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS properties;
-- DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL CHECK (position('@' IN email) > 1) UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  avatar TEXT NOT NULL DEFAULT 'https://img.icons8.com/fluency-systems-filled/96/null/guest-male.png'
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
  owner_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
  archived BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  property_id INTEGER NOT NULL REFERENCES properties ON DELETE CASCADE,
  guest_id INTEGER NOT NULL REFERENCES users ON DELETE CASCADE
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_id INTEGER NOT NULL REFERENCES users,
  to_id INTEGER NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  image_key VARCHAR(255) NOT NULL,
  property_id INTEGER NOT NULL REFERENCES properties ON DELETE CASCADE,
  is_cover_image BOOLEAN DEFAULT FALSE
);
