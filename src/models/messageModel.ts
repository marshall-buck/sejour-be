import { NotFoundError } from "../expressError";
import { db } from "../db";
import { MessageData, MessageResultData } from "../types";

/** Related functions for Message */

class Message {
  /** Add new message to database --
   *
   * Returns newly created message:
   *  {id, fromUsername, toUsername, body, sent_at}
   */

  static async create({
    fromUsername,
    toUsername,
    body,
  }: Omit<MessageData, "id" | "sentAt">): Promise<MessageData> {
    const result = await db.query(
      `INSERT INTO messages (from_username,
                            to_username,
                            body,
                            sent_at)
          VALUES ($1, $2, $3, current_timestamp)
          RETURNING id, from_username AS "fromUsername",
                    to_username AS "toUsername", body, sent_at AS "sentAt"`,
      [fromUsername, toUsername, body]
    );

    return result.rows[0] as MessageData;
  }

  /** Updates read_at for message when read by user
   *
   * Modify read_at property to the current timestamp
   *
   * Returns {id, read_at}
   * Throws NotFoundError if no message found for id
   *
   **/

  static async markRead(
    id: number
  ): Promise<Pick<MessageData, "id" | "readAt">> {
    const result = await db.query(
      `UPDATE messages
          SET read_at = current_timestamp
             WHERE id = $1
             RETURNING id, read_at AS "readAt"`,
      [id]
    );
    const message: Pick<MessageData, "id" | "readAt"> = result.rows[0];

    if (!message) throw new NotFoundError(`No such message: ${id}`);

    return message;
  }

  /** Get a message by id
   *
   * Returns {id, fromUser, toUser, body, sentAt, readAt}
   * where both toUser and fromUser = {username, firstName, lastName, phone}
   * Throws NotFoundError if no message found for id
   */

  static async get(id: number): Promise<MessageResultData> {
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              f.first_name AS from_first_name,
              f.last_name AS from_last_name,
              f.avatar AS from_avatar,
              m.to_username,
              t.first_name AS to_first_name,
              t.last_name AS to_last_name,
              t.avatar AS to_avatar,
              m.body,
              m.sent_at,
              m.read_at
          FROM messages AS m
              JOIN users AS f ON m.from_username = f.username
              JOIN users AS t ON m.to_username = t.username
          WHERE m.id = $1`,
      [id]
    );
    // TODO: Create type for query results, and change to camelCase
    const message = result.rows[0];

    if (!message) throw new NotFoundError(`No such message: ${id}`);

    return {
      id: message.id,
      fromUser: {
        username: message.from_username,
        firstName: message.from_first_name,
        lastName: message.from_last_name,
        avatar: message.from_avatar,
      },
      toUser: {
        username: message.to_username,
        firstName: message.to_first_name,
        lastName: message.to_last_name,
        avatar: message.to_avatar,
      },
      body: message.body,
      sentAt: message.sent_at,
      readAt: message.read_at,
    } as MessageResultData;
  }
}

export { Message };
