import { NotFoundError } from "../expressError";
import { db } from "../db";
import { MessageData, MessageQueryResult, MessageResultData } from "../types";

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

    const message: MessageData = result.rows[0];
    return message;
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
    NotFoundError.handler(message, `No such message: ${id}`);

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
              m.from_username AS "fromUsername",
              f.first_name AS "fromFirstName",
              f.last_name AS "fromLastName",
              f.avatar AS "fromAvatar",
              m.to_username AS "toUsername",
              t.first_name AS "toFirstName",
              t.last_name AS "toLastName",
              t.avatar AS "toAvatar",
              m.body,
              m.sent_at AS "sentAt",
              m.read_at AS "readAt"
          FROM messages AS m
              JOIN users AS f ON m.from_username = f.username
              JOIN users AS t ON m.to_username = t.username
          WHERE m.id = $1`,
      [id]
    );

    const messageResult: MessageQueryResult = result.rows[0];
    NotFoundError.handler(messageResult, `No such message: ${id}`);

    const message: MessageResultData = {
      id: messageResult.id,
      fromUser: {
        username: messageResult.fromUsername,
        firstName: messageResult.fromFirstName,
        lastName: messageResult.fromLastName,
        avatar: messageResult.fromAvatar,
      },
      toUser: {
        username: messageResult.toUsername,
        firstName: messageResult.toFirstName,
        lastName: messageResult.toLastName,
        avatar: messageResult.toAvatar,
      },
      body: messageResult.body,
      sentAt: messageResult.sentAt,
      readAt: messageResult.readAt,
    };

    return message;
  }
}

export { Message };
