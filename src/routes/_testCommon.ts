import { db } from "../db";
import { User } from "../models/userModel";
import { createToken } from "../helpers/tokens";
import { UserResponse } from "../types";

const testUsers: number[] = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM users");

  await registerTestUsers();
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

/** Test JWT tokens */
const u1Token = createToken({ id: testUsers[0], isAdmin: false });
const u2Token = createToken({ id: testUsers[1], isAdmin: false });
const adminToken = createToken({ id: testUsers[2], isAdmin: true });

export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
};

/***************** HELPER FUNCTIONS FOR POPULATING DB BEFORE ALL **************/

/** Add users to DB with test users */
async function registerTestUsers() {
  const u1 = await User.register({
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
    avatar: "test_url1",
  });
  const u2 = await User.register({
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
    avatar: "test_url2",
  });
  const u3 = await User.register({
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
    avatar: "test_url3",
  });

  testUsers.push(u1.id, u2.id, u3.id);
}
