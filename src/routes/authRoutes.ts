import express, { NextFunction, Router, Request, Response } from "express";
import jsonschema from "jsonschema";
import { BadRequestError } from "../expressError";
import { createToken } from "../helpers/tokens";
import { User } from "../models/userModel";
import userAuthSchema from "../schemas/userAuth.json";
import userRegisterSchema from "../schemas/userRegister.json";

/** Routes for authentication. */
const router: Router = express.Router();

/** POST /auth/login:  { email, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post(
  "/login",
  async function (req: Request, res: Response, next: NextFunction) {
    const validator = jsonschema.validate(req.body, userAuthSchema, {
      required: true,
    });
    if (!validator.valid) {
      throw new BadRequestError();
    }
    const { email, password } = req.body;
    const user = await User.authenticate({ email, password });
    const token = createToken(user);
    return res.json({ token });
  }
);

/** POST /auth/register:   { user } => { token }
 *
 * { user } must include { id, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post(
  "/register",
  async function (req: Request, res: Response, next: NextFunction) {
    const validator = jsonschema.validate(req.body, userRegisterSchema, {
      required: true,
    });
    if (!validator.valid) {
      throw new BadRequestError();
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  }
);

export { router as authRoutes };
