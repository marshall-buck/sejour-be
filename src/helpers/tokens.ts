import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { TokenPayload } from "../types";

/** return signed JWT from user data. */

function createToken(user: TokenPayload) {
  console.assert(
    user.isAdmin !== undefined,
    "createToken passed user without isAdmin property"
  );

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}
export { createToken };
