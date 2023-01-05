import express, { NextFunction, Router, Request, Response } from "express";
import { ensureCorrectUser } from "../middleware/authMiddleware";
import { User } from "../models/userModel";
import { MessageFromResponse, MessageToResponse, UserResponse } from "../types";

/** Routes for users. */
const router: Router = express.Router();

/** GET /id
 * Get a user by { id } => { user }
 *
 * Returns user data: { id, firstName, lastName, avatar, email, isAdmin }
 *
 * Authorization required: same user-as-:id
 */
router.get(
  "/:id",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    const id: number = +req.params.id;
    const user: UserResponse = await User.get({ id });
    return res.json({ user });
  }
);

/** GET /:id/to
 * Get messages to user by user id
 *
 * Returns => { messages: [{id, body, sentAt, readAt, fromUser: {}}, ...] }
 *  where fromUser is: { id, firstName, lastName, avatar }
 */
router.get(
  "/:id/messages-to",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    const id: number = +req.params.id;
    const messages: MessageToResponse[] = await User.messagesTo({ id });
    return res.json({ messages });
  }
);

/** GET /:id/from
 * Get messages from user by user id
 *
 * Returns => { messages: [{id, body, sentAtreadAt, toUser: {}}, ...]}
 *  where toUser is: { id, firstName, lastName, avatar }
 */
router.get(
  "/:id/messages-from",
  ensureCorrectUser,
  async function (req: Request, res: Response, next: NextFunction) {
    const id: number = +req.params.id;
    const messages: MessageFromResponse[] = await User.messagesFrom({ id });
    return res.json({ messages });
  }
);

/** PATCH /:id/
 * Updates the user by id with new user name {firstName, lastName}
 */
// router.patch(
//   "/:id/",
//   async function (req: Request, res: Response, next: NextFunction) {
//     const id: number = +req.params.id;
//   }
// );

export { router as userRoutes };
