import { db } from "../db";
import bcrypt from "bcrypt";
import { UserData, MessageData } from "../index";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../expressError";
import { BCRYPT_WORK_FACTOR } from "../config.js";

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, firstName, lastName, avatar, email, isAdmin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate({
    username,
    password,
  }: Pick<UserData, "username" | "password">) {
    // try to find the user first
    const result = await db.query(
      `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  avatar,
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, avatar, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    username,
    password,
    firstName,
    lastName,
    avatar,
    email,
    isAdmin,
  }: UserData) {
    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            avatar,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING username, first_name AS "firstName", last_name AS
                            "lastName",avatar,  email, is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, avatar, email, isAdmin]
    );

    const user = result.rows[0];

    return user;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, avatar, email, is_admin }
   *
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username: Pick<UserData, "username">) {
    const userRes = await db.query(
      `SELECT username,
                    first_name AS "firstName",
                    last_name AS "lastName",
                    avatar,
                    email,
                    is_admin AS "isAdmin"
             FROM users
             WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, toUser: {username, firstName, lastName, avatar}, body, sentAt, readAt}]
   *
   * where toUser is
   *   {username, firstName, lastName, avatar}
   */

  static async messagesFrom(username: Pick<UserData, "username">) {
    const results = await db.query(
      `SELECT m.id,
              m.to_username AS m.username,
              u.first_name AS u.firstName,
              u.last_name AS u.lastName,
              u.avatar,
              m.body,
              m.sent_at AS m.sentAt,
              m.read_at AS m.readAt
          FROM messages AS m
            JOIN users AS u
              ON u.username = m.to_username
          WHERE from_username = $1`,
      [username]
    );
    const messages = results.rows;

    if (!messages) {
      throw new NotFoundError("username not found");
    }

    return messages.map((m: MessageData) => {
      return {
        id: m.id,
        toUser: {
          username: m.username,
          firstName: m.firstName,
          lastName: m.lastName,
        },
        body: m.body,
        sentAt: m.sentAt,
        readAt: m.readAt,
      };
    });
  }

  /** Return messages to this user.
   *
   * [{id,
   *  fromUser: {username, firstName, lastName, avatar},
   *  body,
   *  sentAt,
   *  readAt}]
   *
   * where fromUser is
   *   {username, firstName, lastName, avatar}
   */

  static async messagesTo(username: Pick<UserData, "username">) {
    const results = await db.query(
      `SELECT m.id,
              m.from_username AS m.fromUsername,
              u.firstName AS u.firstName,
              u.lastName AS u.lastName,
              u.avatar,
              m.body,
              m.sent_at AS m.sentAt,
              m.read_at AS m.readAt
          FROM messages AS m
            JOIN users AS u
              ON u.username = m.from_username
          WHERE to_username = $1`,
      [username]
    );
    const messages = results.rows;

    if (!messages) {
      throw new NotFoundError("username not found");
    }

    return messages.map((m: MessageData) => {
      return {
        id: m.id,
        fromUser: {
          username: m.username,
          firstName: m.firstName,
          lastName: m.lastName,
        },
        body: m.body,
        sentAt: m.sentAt,
        readAt: m.readAt,
      };
    });
  }
}

export { User };