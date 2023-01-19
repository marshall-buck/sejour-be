/** Convenience middleware to handle common auth cases in routes. */
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { UnauthorizedError } from "../expressError";
import { Property } from "../models/propertyModel";

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the id and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */
function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must provide a valid token & be user matching
 *  id provided as route param.
 *
 *  If not, raises Unauthorized.
 */
function ensureCorrectUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = res.locals.user;
    if (!(user && user.id === +req.params.id)) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use to check that the logged in user id is the same as
 * property owner id to authorize patch and post request to property routes
 *
 * If not, raises Unauthorized.
 */
async function ensureUserIsPropertyOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ownerId = await Property.getOwnerId({ id: +req.params.id });
    if (+ownerId.ownerId !== res.locals.user.id) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

export {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureUserIsPropertyOwner,
};
