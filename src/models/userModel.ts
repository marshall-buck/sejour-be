import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config";
import { db } from "../db";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../expressError";
import {
  MessageFromResponse,
  MessageToResponse,
  UserData,
  UserMessageData,
  UserResponse,
} from "../types";

/** Related functions for users. */
class User {
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
  }: Pick<UserData, "username" | "password">): Promise<UserResponse> {
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
    const userResult: UserData = result.rows[0];

    if (userResult) {
      const isValid = await bcrypt.compare(password, userResult.password);
      if (isValid === true) {
        const user: UserResponse = {
          username: userResult.username,
          firstName: userResult.firstName,
          lastName: userResult.lastName,
          avatar: userResult.avatar,
          email: userResult.email,
          isAdmin: userResult.isAdmin,
        };

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
  }: UserData): Promise<UserResponse> {
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

    const user: UserResponse = result.rows[0];

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
  }: Pick<UserData, "username">): Promise<UserResponse> {
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

    const user: UserResponse = userRes.rows[0];
    NotFoundError.handler(user, `No user: ${username}`);

    return user;
  }

  /** Get all messages sent from a user by username
   * Return messages from this user:
   * [{id, toUser: {username, firstName, lastName, avatar}, body, sentAt, readAt}]
   * where toUser is {username, firstName, lastName, avatar}
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
    const messagesResult: UserMessageData[] = results.rows;
    NotFoundError.handler(messagesResult, `No messages found from ${username}`);

    const messages: MessageFromResponse[] = messagesResult.map(
      (m: UserMessageData) => {
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
      }
    );
    return messages;
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
  static async messagesTo({ username }: Pick<UserData, "username">) {
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
    const messagesResults: UserMessageData[] = results.rows;
    NotFoundError.handler(messagesResults, `No messages found for ${username}`);

    const messages: MessageToResponse[] = messagesResults.map(
      (m: UserMessageData) => {
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
      }
    );

    return messages;
  }
  /** Updates user information
   * Returns { id, username, firstName, lastName, avatar, email, isAdmin}
   *
   *
   */
  static async update({
    username,
    firstName,
    lastName,

    email,
  }: Omit<UserData, "id" | "password" | "isAdmin">) {
    // checked if username exists already
    // select all from users where username = true throw
    const result = await db.query(
      `UPDATE users
          SET username = $1, first_name = $2, last_name = $3, avatar = $4
              WHERE id = $4
                  RETURNING id,
                            title,
                            street,
                            city,
                            state,
                            zipcode,
                            latitude,
                            longitude,
                            price,
                            description,
                            owner_username AS "ownerUsername"`,
      [title, description, price, id]
    );

    const property: PropertyData = result.rows[0];
    NotFoundError.handler(property, `No property: ${id}`);

    return property;
  }
}

export { User };
