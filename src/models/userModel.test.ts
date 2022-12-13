import { NotFoundError, BadRequestError, UnauthorizedError } from "../expressError";
import { query } from "../db";
import { authenticate, register, get } from "./userModel";
import { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await authenticate("u1", "password1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      phone: '123-456-7890',
      email: "u1@email.com",
      isAdmin: false,
    });
  });

  test("unauth if no such user", async function () {
    try {
      await authenticate("nope", "password");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await authenticate("c1", "wrong");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    phone: '123-456-7890',
    email: "test@test.com",
    isAdmin: false,
  };

  test("works", async function () {
    let user = await register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("works: adds admin", async function () {
    let user = await register({
      ...newUser,
      password: "password",
      isAdmin: true,
    });
    expect(user).toEqual({ ...newUser, isAdmin: true });
    const found = await query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await register({
        ...newUser,
        password: "password",
      });
      await register({
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
    let user = await get("u1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      phone: '123-456-7890',
      email: "u1@email.com",
      isAdmin: false,

    });
  });

  test("not found if no such user", async function () {
    try {
      await get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

function beforeAll(commonBeforeAll: any) {
  throw new Error("Function not implemented.");
}


function beforeEach(commonBeforeEach: any) {
  throw new Error("Function not implemented.");
}


function afterEach(commonAfterEach: any) {
  throw new Error("Function not implemented.");
}


function afterAll(commonAfterAll: any) {
  throw new Error("Function not implemented.");
}


function expect(user: any) {
  throw new Error("Function not implemented.");
}
