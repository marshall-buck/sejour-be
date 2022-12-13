"use strict";

/** Routes for users. */

const express = require("express");
const { ensureCorrectUser } = require("../middleware/authMiddleware");
const User = require("../models/userModel");

const router = express.Router();


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, phone, email, isAdmin }
 *
 * Authorization required: same user-as-:username
 **/

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to",
  ensureCorrectUser,
  async function (req, res, next) {
    const username = req.params.username;
    const messages = await User.messagesTo(username);

    return res.json({ messages });
  });

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from",
  ensureCorrectUser,
  async function (req, res, next) {
    const username = req.params.username;
    const messages = await User.messagesFrom(username);

    return res.json({ messages });
  });


module.exports = router;
