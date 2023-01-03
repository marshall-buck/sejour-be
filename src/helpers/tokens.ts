import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { TokenPayload } from "../types";

/** return signed JWT from user data. */

function createToken({ username, isAdmin }: TokenPayload) {
  console.assert(
    isAdmin !== undefined,
    "createToken passed user without isAdmin property"
  );

  let payload = {
    username: username,
    isAdmin: isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}
export { createToken };
