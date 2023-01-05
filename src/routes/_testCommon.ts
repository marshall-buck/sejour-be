import { db } from "../db";
import { User } from "../models/userModel";
import { Message } from "../models/messageModel";
import { createToken } from "../helpers/tokens";


type UserTestData = {
  id: number;
  token: string;
};
const testUserIds: UserTestData[] = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM users");

  await registerTestUsers();
  await createTestMessages();
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
  testUserIds,
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

  testUserIds.push(
    {
      id: u1.id,
      token: createToken({ id: u1.id, isAdmin: false }),
    },
    {
      id: u2.id,
      token: createToken({ id: u2.id, isAdmin: false }),
    },
    {
      id: u3.id,
      token: createToken({ id: u3.id, isAdmin: true }),
    }
  );
}

async function createTestMessages() {
  await Message.create({
    fromId: testUserIds[1].id,
    toId: testUserIds[0].id,
    body: "hello u1"
  })

  await Message.create({
    fromId: testUserIds[0].id,
    toId: testUserIds[1].id,
    body: "hello u2"
  })
}
