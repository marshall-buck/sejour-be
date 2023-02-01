/** JWT token functions */
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { TokenPayload } from "../types";

/** Create a new token from id and isAdmin params
 * Return signed JWT from user data. */
function createToken({ id, isAdmin }: TokenPayload) {
  console.assert(
    isAdmin !== undefined,
    "createToken passed user without isAdmin property"
  );

  const payload = {
    id: id,
    isAdmin: isAdmin || false,
  };
  return jwt.sign(payload, SECRET_KEY);
}


export { createToken };
