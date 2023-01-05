import { db } from "../db";
import { User } from "../models/userModel";
import { createToken } from "../helpers/tokens";
// import Company from "../models/company";
// import Job from "../models/job";

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
const u1Token = createToken({ id: "u1", isAdmin: false });
const u2Token = createToken({ id: "u2", isAdmin: false });
const adminToken = createToken({ id: "admin", isAdmin: true });

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
  await User.register({
    id: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
    avatar: "test_url1",
  });
  await User.register({
    id: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
    avatar: "test_url2",
  });
  await User.register({
    id: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
    avatar: "test_url3",
  });
}
