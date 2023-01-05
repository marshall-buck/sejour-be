/** Routes for users. */

import express, { NextFunction, Router, Request, Response } from "express";
import { ensureCorrectUser } from "../middleware/authMiddleware";
import { User } from "../models/userModel";

const router = express.Router();

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, avatar, email, isAdmin }
 *
 * Authorization required: same user-as-:username
 **/

router.get(
  "/:username",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.params.username;
      const user = await User.get({ username });
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, avatar}}, ...]}
 *
 **/
router.get(
  "/:username/to",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    const username = req.params.username;
    const messages = await User.messagesTo({ username });

    return res.json({ messages });
  }
);

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, avatar}}, ...]}
 *
 **/
router.get(
  "/:username/from",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    const username = req.params.username;
    const messages = await User.messagesFrom({ username });

    return res.json({ messages });
  }
);

/** POST /:username/:id */
router.patch(
  "/:username/:id",
  async function (req: Request, res: Response, next: NextFunction) {}
);

export { router as userRoutes };
