"use strict";

const Router = require("express").Router;
const router = new Router();

const Message = require("../models/messageModel");

const { UnauthorizedError, BadRequestError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {id, first_name, last_name, phone},
 *               to_user: {id, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", async function (req, res, next) {
  const id = res.locals.user.id;
  const id = req.params.id;
  const message = await Message.get(id);

  if (id !== message.from_user.id && id !== message.to_user.id) {
    throw new UnauthorizedError("access not allowed");
  }

  return res.json({ message });
});

/** POST / - post message.
 *
 * {to_id, body} =>
 *   {message: {id, from_id, to_id, body, sent_at}}
 *
 **/
router.post("/", async function (req, res, next) {
  const fromId = res.locals.user.id;
  const { toId, body } = req.body;
  const message = await Message.create({
    fromId,
    toId,
    body,
  });

  return res.status(201).json({ message });
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async function (req, res, next) {
  const id = res.locals.user.id;
  const id = req.params.id;
  const result = await Message.get(id);

  if (id !== result.to_user.id) {
    throw new UnauthorizedError("access not allowed");
  }

  const message = await Message.markRead(id);

  return res.json({ message });
});

module.exports = router;
