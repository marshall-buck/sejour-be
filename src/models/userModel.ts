import { db } from "../db";
import bcrypt from "bcrypt";
import { UserData, UserMessageData } from "../types";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../expressError";
import { BCRYPT_WORK_FACTOR } from "../config";

/** Related functions for users. */

class User {
  /** Given result data and an error message
   * Throws a new NotFoundError if result data is undefined,
   * along with error message */

  static _notFoundHandler<Type>(result: Type, message = "not found"): void {
    if (!result) throw new NotFoundError(message);
  }

  /** Authenticate user with username, password.
   *
   * Returns { username, firstName, lastName, avatar, email, isAdmin }
   *
   * Throws UnauthorizedError if:
   * - username not found OR
   * - wrong password
   **/

  static async authenticate({
    username,
    password,
  }: Pick<UserData, "username" | "password">): Promise<UserData> {
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
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register new user with user registration data.
   *
   * Returns { username, firstName, lastName, avatar, email, isAdmin }
   *
   * Throws BadRequestError on duplicate usernames.
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
        RETURNING username, first_name AS "firstName", last_name AS "lastName",
                  avatar, email, is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, avatar, email, isAdmin]
    );

    const user = result.rows[0];

    return user;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, firstName, lastName, avatar, email, isAdmin }
   *
   *
   * Throws NotFoundError if user not found.
   **/

  static async get({
    username,
  }: Pick<UserData, "username">): Promise<UserData> {
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

    const user: UserData = userRes.rows[0];

    this._notFoundHandler(user, `No user: ${username}`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, toUser: {username, firstName, lastName, avatar}, body, sentAt, readAt}]
   *
   * where toUser is
   *   {username, firstName, lastName, avatar}
   */

  static async messagesFrom({ username }: Pick<UserData, "username">) {
    const results = await db.query(
      `SELECT m.id,
              m.to_username AS "username",
              u.first_name AS "firstName",
              u.last_name AS "lastName",
              u.avatar AS "avatar",
              m.body,
              m.sent_at AS "sentAt",
              m.read_at AS "readAt"
          FROM messages AS m
            JOIN users AS u
              ON u.username = m.to_username
          WHERE from_username = $1`,
      [username]
    );
    const messages: UserMessageData[] = results.rows;

    this._notFoundHandler(messages, `No messages found from ${username}`);

    return messages.map((m: UserMessageData) => {
      return {
        id: m.id,
        toUser: {
          username: m.username,
          firstName: m.firstName,
          lastName: m.lastName,
          avatar: m.avatar,
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

  static async messagesTo({username}: Pick<UserData, "username">) {
    const results = await db.query(
      `SELECT m.id,
              m.from_username AS "username",
              u.first_name AS "firstName",
              u.last_name AS "lastName",
              u.avatar AS "avatar",
              m.body,
              m.sent_at AS "sentAt",
              m.read_at AS "readAt"
          FROM messages AS m
            JOIN users AS u
              ON u.username = m.from_username
          WHERE to_username = $1`,
      [username]
    );
    const messages = results.rows;

    this._notFoundHandler(messages, `No messages found for ${username}`);

    return messages.map((m: UserMessageData) => {
      return {
        id: m.id,
        fromUser: {
          username: m.username,
          firstName: m.firstName,
          lastName: m.lastName,
          avatar: m.avatar,
        },
        body: m.body,
        sentAt: m.sentAt,
        readAt: m.readAt,
      };
    });
  }
}

export { User };
