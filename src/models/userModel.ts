import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR, AVATAR_ICON } from "../config";
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
  /** Authenticate user with email, password.
   *
   * Returns { id, firstName, lastName, avatar, email, isAdmin }
   *
   * Throws UnauthorizedError if:
   * - email not found OR
   * - wrong password
   **/
  static async authenticate({
    email,
    password,
  }: Pick<UserData, "email" | "password">): Promise<UserResponse> {
    // try to find the user first
    const result = await db.query(
      `SELECT id,
              password,
              first_name AS "firstName",
              last_name AS "lastName",
              avatar,
              email,
              is_admin AS "isAdmin"
           FROM users
           WHERE email = $1`,
      [email]
    );
    const userResult: UserData = result.rows[0];

    if (userResult) {
      const isValid = await bcrypt.compare(password, userResult.password);
      if (isValid === true) {
        const user: UserResponse = {
          id: userResult.id,
          firstName: userResult.firstName,
          lastName: userResult.lastName,
          avatar: userResult.avatar,
          email: userResult.email,
          isAdmin: userResult.isAdmin,
        };

        return user;
      }
    }
    throw new UnauthorizedError("Invalid id/password");
  }

  /** Register new user with user registration data.
   *
   * Returns { id, firstName, lastName, avatar, email, isAdmin }
   *
   * Throws BadRequestError on duplicate ids.
   **/
  static async register({
    password,
    firstName,
    lastName,
    avatar,
    email,
    isAdmin,
  }: Omit<UserData, "id">): Promise<UserResponse> {
    const duplicateCheck = await db.query(
      `SELECT email
          FROM users
          WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    if (!avatar) avatar = AVATAR_ICON;

    const result = await db.query(
      `INSERT INTO users
           (password,
            first_name,
            last_name,
            avatar,
            email,
            is_admin)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, first_name AS "firstName", last_name AS "lastName",
                  avatar, email, is_admin AS "isAdmin"`,
      [hashedPassword, firstName, lastName, avatar, email, isAdmin]
    );

    const user: UserResponse = result.rows[0];

    return user;
  }
  /** Given a id, return data about user.
   *
   * Returns { id, firstName, lastName, avatar, email, isAdmin }
   *
   *
   * Throws NotFoundError if user not found.
   **/
  static async get({ id }: Pick<UserData, "id">): Promise<UserResponse> {
    const userRes = await db.query(
      `SELECT id,
              first_name AS "firstName",
              last_name AS "lastName",
              avatar,
              email,
              is_admin AS "isAdmin"
        FROM users
        WHERE id = $1`,
      [id]
    );

    const user: UserResponse = userRes.rows[0];
    NotFoundError.handler(user, `No user: ${id}`);

    return user;
  }

  /** Get all messages sent from a user by id
   * Return messages from this user:
   * [{id, toUser: {id, firstName, lastName, avatar}, body, sentAt, readAt}]
   * where toUser is {id, firstName, lastName, avatar}
   */
  static async messagesFrom({ id }: Pick<UserData, "id">) {
    const results = await db.query(
      `SELECT m.id,
              m.to_id AS "userId",
              u.first_name AS "firstName",
              u.last_name AS "lastName",
              u.avatar AS "avatar",
              m.body,
              m.sent_at AS "sentAt",
              m.read_at AS "readAt"
          FROM messages AS m
            JOIN users AS u
              ON u.id = m.to_id
          WHERE from_id = $1`,
      [id]
    );
    const messagesResult: UserMessageData[] = results.rows;
    NotFoundError.handler(messagesResult, `No messages found from ${id}`);

    const messages: MessageFromResponse[] = messagesResult.map(
      (m: UserMessageData) => {
        return {
          id: m.id,
          toUser: {
            id: m.userId,
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
   *  fromUser: {id, firstName, lastName, avatar},
   *  body,
   *  sentAt,
   *  readAt}]
   *
   * where fromUser is
   *   {id, firstName, lastName, avatar}
   */
  static async messagesTo({ id }: Pick<UserData, "id">) {
    const results = await db.query(
      `SELECT m.id,
              m.from_id AS "userId",
              u.first_name AS "firstName",
              u.last_name AS "lastName",
              u.avatar AS "avatar",
              m.body,
              m.sent_at AS "sentAt",
              m.read_at AS "readAt"
          FROM messages AS m
            JOIN users AS u
              ON u.id = m.from_id
          WHERE to_id = $1`,
      [id]
    );
    const messagesResults: UserMessageData[] = results.rows;
    NotFoundError.handler(messagesResults, `No messages found for ${id}`);

    const messages: MessageToResponse[] = messagesResults.map(
      (m: UserMessageData) => {
        return {
          id: m.id,
          fromUser: {
            id: m.userId,
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

  /** Updates user firstName and lastName
   * Finds user by id
   *
   * Returns { id, firstName, lastName, avatar, email, isAdmin}
   *
   * Throws NotFoundError if user not found.
   */
  static async updateName({
    id,
    firstName,
    lastName,
  }: Pick<UserData, "id" | "firstName" | "lastName">): Promise<UserResponse> {
    const result = await db.query(
      `UPDATE users
          SET first_name = $2, last_name = $3
              WHERE id = $1
                  RETURNING id,
                            first_name AS "firstName",
                            last_name AS "lastName",
                            avatar,
                            email,
                            is_admin AS "isAdmin"`,
      [id, firstName, lastName]
    );
    const user: UserData = result.rows[0];
    NotFoundError.handler(user, `No user: ${id}`);

    return user;
  }

  /** Updates user email
   * Finds user by id
   *
   * Returns { id, firstName, lastName, avatar, email, isAdmin}
   *
   * Throws NotFoundError if user not found.
   * Throws BadRequestError if email already exists
   */
  static async updateEmail({
    id,
    email,
  }: Pick<UserData, "id" | "email">): Promise<UserResponse> {
    // verify email is unique
    const emailRes = await db.query(
      `SELECT email
          FROM users
          WHERE email = $1`,
      [email]
    );
    if (emailRes.rows[0]) {
      throw new BadRequestError(`An account for ${email} already exists`);
    }

    const result = await db.query(
      `UPDATE users
          SET email = $2
              WHERE id = $1
                  RETURNING id,
                            first_name AS "firstName",
                            last_name AS "lastName",
                            avatar,
                            email,
                            is_admin AS "isAdmin"`,
      [id, email]
    );
    const user: UserData = result.rows[0];
    NotFoundError.handler(user, `No user: ${id}`);

    return user;
  }
}

export { User };
