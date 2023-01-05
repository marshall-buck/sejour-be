/** Routes for users. */

import express, { NextFunction, Router, Request, Response } from "express";
import { ensureCorrectUser } from "../middleware/authMiddleware";
import { User } from "../models/userModel";

const router = express.Router();

/** GET /[id] => { user }
 *
 * Returns { id, firstName, lastName, avatar, email, isAdmin }
 *
 * Authorization required: same user-as-:id
 **/

router.get(
  "/:id",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const user = await User.get({ id });
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /:id/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {id, first_name, last_name, avatar}}, ...]}
 *
 **/
router.get(
  "/:id/to",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const messages = await User.messagesTo({ id });

    return res.json({ messages });
  }
);

/** GET /:id/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {id, first_name, last_name, avatar}}, ...]}
 *
 **/
router.get(
  "/:id/from",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    const messages = await User.messagesFrom({ id });

    return res.json({ messages });
  }
);

/** POST /:id/:id */
router.patch(
  "/:id/:id",
  async function (req: Request, res: Response, next: NextFunction) {}
);

export { router as userRoutes };
