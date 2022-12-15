import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config";
import { db } from "../db";
import { MessageData, PropertyData } from "../types";

const propertyIds: number[] = [];
const messageIds: number[] = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM bookings");
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM properties");
  await db.query("DELETE FROM users");

  await db.query(
    ` INSERT INTO users (username,
                          password,
                          first_name,
                          last_name,
                          email,
                          avatar)
      VALUES ('u1', $1, 'U1F', 'U1L','u1@email.com',  'test http'),
             ('u2', $2, 'U2F', 'U2L','u2@email.com',  'test http')
      RETURNING username
      `,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );
  const resultsProperties = await db.query(`
      INSERT INTO properties (title, street, city, state, zipcode, latitude,
        longitude, description, price, owner_username, archived)
      VALUES ('property one', '123 lane', 'test city', 'test state', '11111',
      '180.0000000', '-180.0000000', 'test description', 100, 'u1', false),
             ('property two', '123 lane', 'test city', 'test state', '11111',
      '180.0000000', '-180.0000000', 'test description pool', 200, 'u2', false),
             ('property three', '123 lane', 'test city', 'test state', '11111',
      '180.0000000', '-180.0000000', 'test description', 200, 'u2', true)
      RETURNING id
    `);

  propertyIds.splice(
    0,
    0,
    ...resultsProperties.rows.map((r: PropertyData) => r.id)
  );

  const resultsMessages = await db.query(`
      INSERT INTO messages (from_username, to_username, body, sent_at)
          VALUES ('u1', 'u2', 'test message', current_timestamp)
              RETURNING id`);

  messageIds.splice(
    0,
    0,
    ...resultsMessages.rows.map((r: MessageData) => r.id)
  );
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds,
  messageIds,
};
