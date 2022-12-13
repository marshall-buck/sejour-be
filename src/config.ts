/** Shared config for application; can be required many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY
  ? +process.env.SECRET_KEY
  : "secret-dev";

const PORT = process.env.PORT ? +process.env.PORT : 3001;

export { SECRET_KEY, PORT };
