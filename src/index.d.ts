type UserData = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  isAdmin: boolean;
};

type MessageData = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  body: string;
  sentAt: string;
  readAt: string;
};

type PropertyData = {
  id: number;
  title: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  description: string;
  price: number;
  username: string;
};

export { UserData, MessageData, PropertyData };

/**
 * CREATE TABLE properties (
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
  owner_username VARCHAR(25) NOT NULL REFERENCES users ON DELETE CASCADE
);
 */
