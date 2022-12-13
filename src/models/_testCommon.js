const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");
const propertyIds = [];
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
                          phone,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', '123-456-7890' ,'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', '198-765-4321', 'u2@email.com')
        RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );
  const resultsProperties = await db.query(`
    INSERT INTO properties(title, address, description , price, owner_username)
      VALUES('one', '123 lane', 'blah blah blah yard', 100, 'u1'),
            ('two', 'long drive', 'pool, jacuzzi, movie theatre', 300, 'u2')
            RETURNING id
      `);

  propertyIds.splice(0, 0, ...resultsProperties.rows.map(r => r.id));
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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds
};
