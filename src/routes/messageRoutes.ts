import express, { Router } from "express";
import jsonschema from "jsonschema";
import { BadRequestError, UnauthorizedError } from "../expressError";
import { ensureLoggedIn } from "../middleware/authMiddleware";
import { Message } from "../models/messageModel";
import messageNewSchema from "../schemas/messageNew.json";

/** Routes for messages */
const router: Router = express.Router();

/** GET /:id - get detail of message
 *
 * Returns {{id, fromUser, toUser, body, sentAt, readAt}
 * where both toUser and fromUser = {id, firstName, lastName, avatar}
 *
 * Authorization: authenticated user
 *
 * Makes sure that the currently-logged-in users is either the to or from user,
 * else throws UnAuthorizedError
 * Throws NotFoundError if no message found for id
 *
 */
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  const userId = res.locals.user.id;
  const id = +req.params.id;
  const message = await Message.get({ id });

  if (userId !== message.fromUser.id && userId !== message.toUser.id) {
    throw new UnauthorizedError();
  }
  return res.json({ message });
});

/** POST / - create a new message
 *
 * Creates a new message from request { toId, body } and fromId
 * Returns the new message {id, fromId, toId, body, sentAt}
 *
 * Authorization: authenticated user
 */
router.post("/", ensureLoggedIn, async function (req, res, next) {
  const fromId = res.locals.user.id;
  const reqBody = { ...req.body, toId: +req.body.toId };
  const validator = jsonschema.validate(reqBody, messageNewSchema, {
    required: true,
  });
  if (!validator.valid) {
    throw new BadRequestError();
  }
  const message = await Message.create({fromId, ...reqBody});
  return res.status(201).json({ message });
});

/** PATCH /:id/ - mark message as read:
 *
 * Gets a message by id and updates the readAt property to current timestamp
 * Returns message: {id, read_at}
 *
 * Authorization: authenticated user
 * Makes sure that the only the intended recipient can mark as read.
 */
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  const userId = res.locals.user.id;
  const id = +req.params.id;
  const result = await Message.get({id});

  if (userId !== result.toUser.id) {
    throw new UnauthorizedError();
  }

  const message = await Message.markRead({id});
  return res.json({ message });
});

export { router as messageRoutes };
