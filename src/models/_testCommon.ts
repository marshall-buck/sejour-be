import bcrypt from "bcrypt";

import { db } from "../db";
import { BCRYPT_WORK_FACTOR } from "../config";
import { PropertyData } from "..";

const propertyIds: number[] = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM properties");

  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(
    `
      INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          avatar,
                          email)
      VALUES ('u1', $1, 'U1F', 'U1L', '', 'u1@email.com'),
             ('u2', $2, 'U2F', 'U2L', '', 'u2@email.com')
      RETURNING username
    `,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );
  const resultsProperties = await db.query(
    `
      INSERT INTO properties(title, street, city, state, zipcode, latitude,
        longitude, description , price, owner_username)
      VALUES('property one', '123 lane', 'test city', 'test state', '11111',
      '180.0000000', '-180.0000000', 'test description', 100, 'u1'),
            ('property two', '123 lane', 'test city', 'test state', '11111',
      '180.0000000', '-180.0000000', 'test description', 200, 'u2'),
      RETURNING id
    `
  );

  propertyIds.splice(
    0,
    0,
    ...resultsProperties.rows.map((r: PropertyData) => r.id)
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

export = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds,
};
