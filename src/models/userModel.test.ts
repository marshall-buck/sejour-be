import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../expressError";
import { User } from "./userModel";
import { db } from "../db";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  userIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate({
      email: "u1@email.com",
      password: "password1",
    });
    expect(user).toEqual({
      id: expect.any(Number),
      firstName: "U1F",
      lastName: "U1L",
      avatar: "test url",
      email: "u1@email.com",
      isAdmin: false,
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate({ email: "nope@nope.io", password: "password" });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate({ email: "u1@email.com", password: "wrong" });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  const newUser = {
    firstName: "Test",
    lastName: "Tester",
    avatar: "",
    email: "test@test.com",
    isAdmin: false,
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual({ ...newUser, id: expect.any(Number) });
    const found = await db.query(
      "SELECT * FROM users WHERE email = 'test@test.com'"
    );
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
      isAdmin: true,
    });
    expect(user).toEqual({ ...newUser, id: expect.any(Number), isAdmin: true });
    const found = await db.query(
      "SELECT * FROM users WHERE email = 'test@test.com'"
    );
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    const user = await User.get({ id: userIds[0] });
    expect(user).toEqual({
      id: userIds[0],
      firstName: "U1F",
      lastName: "U1L",
      email: "u1@email.com",
      avatar: "test url",
      isAdmin: false,
    });
  });

  test("not found if no result", async function () {
    try {
      await User.get({ id: 0 });
      throw new Error("fail test, you shouldn't get here");
    } catch (err: any) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual("No user: 0");
    }
  });
});

/************************************** messagesFrom */

describe("messagesFrom", function () {
  test("successfully get messages from user", async function () {
    const message = await User.messagesFrom({ id: userIds[0] });
    expect(message).toEqual([
      {
        id: expect.any(Number),
        toUser: {
          id: userIds[1],
          firstName: "U2F",
          lastName: "U2L",
          avatar: "test url",
        },
        body: "test message",
        sentAt: expect.any(Date),
        readAt: null,
      },
    ]);
  });
});

/************************************** messagesTo */

describe("messagesTo", function () {
  test("successfully get messages to user", async function () {
    const message = await User.messagesTo({ id: userIds[1] });
    expect(message).toEqual([
      {
        id: expect.any(Number),
        fromUser: {
          id: userIds[0],
          firstName: "U1F",
          lastName: "U1L",
          avatar: "test url",
        },
        body: "test message",
        sentAt: expect.any(Date),
        readAt: null,
      },
    ]);
  });
});

/************************************** updateName */

describe("updateName", function () {
  test("successfully updates user's name", async function () {
    const user = await User.updateName({
      id: userIds[0],
      firstName: "newU1F",
      lastName: "newU1L",
    });
    expect(user).toEqual({
      id: userIds[0],
      firstName: "newU1F",
      lastName: "newU1L",
      email: "u1@email.com",
      avatar: "test url",
      isAdmin: false,
    });
  });
});

/************************************** updateEmail */

describe("updateEmail", function () {
  test("successfully updates user's email", async function () {
    const user = await User.updateEmail({
      id: userIds[0],
      email: "newemail@email.com",
    });
    expect(user).toEqual({
      id: userIds[0],
      firstName: "U1F",
      lastName: "U1L",
      email: "newemail@email.com",
      avatar: "test url",
      isAdmin: false,
    });
  });
  test("throws error if user's email already exits", async function () {
    try {
      await User.updateEmail({
        id: userIds[0],
        email: "u2@email.com",
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err: any) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toEqual(
        "An account for u2@email.com already exists"
      );
    }
  });
});
