import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config";
import { db } from "../db";
import {
  MessageData,
  PropertyData,
  ImageData,
  BookingData,
  UserData,
} from "../types";

const userIds: number[] = [];
const propertyIds: number[] = [];
const messageIds: number[] = [];
const imageIds: number[] = [];
const bookingIds: number[] = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM images");
  await db.query("DELETE FROM bookings");
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM properties");
  await db.query("DELETE FROM users");

  await seedUsers();
  await seedProperties();
  await seedMessages();
  await seedImages();
  await seedBookings();
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

/******************** HELPER FUNCTIONS FOR SEEDING DB BEFORE ALL **************/

/** Seed users DB with test users and encrypts passwords before insertion */
async function seedUsers() {
  const resultUsers = await db.query(
    `
    INSERT INTO users  (password,
                        first_name,
                        last_name,
                        email,
                        avatar)
          VALUES ($1, 'U1F', 'U1L','u1@email.com',  'test url'),
                 ($2, 'U2F', 'U2L','u2@email.com',  'test url')
          RETURNING id`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );

  userIds.splice(0, 0, ...resultUsers.rows.map((r: UserData) => r.id));
}

/** Seed properties DB with test properties, creates an array of property Ids */
async function seedProperties() {
  const resultsProperties = await db.query(
    `
      INSERT INTO properties (title,
                              street,
                              city,
                              state,
                              zipcode,
                              latitude,
                              longitude,
                              description,
                              price,
                              owner_id,
                              archived)
          VALUES ('property one', '123 lane', 'test city', 'test state', '11111',
                  '180.0000000', '-180.0000000', 'test description', 100, $1,
                  false),
                 ('property two', '123 lane', 'test city', 'test state', '11111',
                  '180.0000000', '-180.0000000', 'test description pool', 200,
                  $2, false),
                 ('property three', '123 lane', 'test city', 'test state',
                 '11111', '180.0000000', '-180.0000000', 'test description', 200,
                 $2, true)
          RETURNING id`,
    [userIds[0], userIds[1]]
  );

  propertyIds.splice(
    0,
    0,
    ...resultsProperties.rows.map((r: PropertyData) => r.id)
  );
}

/** Seed messages DB with test messages, creates an array of message Ids */
async function seedMessages() {
  const resultsMessages = await db.query(
    `
      INSERT INTO messages (from_id, to_id, body, sent_at)
          VALUES ($1, $2, 'test message', current_timestamp)
              RETURNING id`,
    [userIds[0], userIds[1]]
  );

  messageIds.splice(
    0,
    0,
    ...resultsMessages.rows.map((r: MessageData) => r.id)
  );
}

/** Seed images DB with test images, creates an array of image Ids */
async function seedImages() {
  const resultsImages = await db.query(`
      INSERT INTO images (image_key, property_id, is_cover_image)
          VALUES ('12345678', ${propertyIds[0]}, true),
                 ('23456789', ${propertyIds[0]}, false),
                 ('34567890', ${propertyIds[0]}, false)
              RETURNING id
      `);

  imageIds.splice(0, 0, ...resultsImages.rows.map((r: ImageData) => r.id));
}

/** Seed bookings DB with test bookings, creates an array of booking Ids */
async function seedBookings() {
  const resultsBookings = await db.query(`
      INSERT INTO bookings (start_date, end_date, property_id, guest_id)
          VALUES('2022-11-29T05:00:00.000Z',
                '2022-11-30T05:00:00.000Z',
                ${propertyIds[0]}, ${userIds[1]})
              RETURNING id`);

  bookingIds.splice(
    0,
    0,
    ...resultsBookings.rows.map((r: BookingData) => r.id)
  );
}

export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds,
  messageIds,
  imageIds,
  bookingIds,
  userIds,
};
