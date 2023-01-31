import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../expressError";
import {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
} from "./authMiddleware";
import { db } from "../db";
import { SECRET_KEY } from "../config";

// User ID for test purposes
const USER_ID = 1;

const testJwt = jwt.sign({ id: USER_ID, isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ id: USER_ID, isAdmin: false }, "wrong");

async function commonAfterAll() {
  await db.end();
}
afterAll(commonAfterAll)

/******************************************************************************/

describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req: any = {
      headers: { authorization: `Bearer ${testJwt}` },
    };
    const res: any = { locals: {} };
    const next = function (err: any) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        id: USER_ID,
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req: any = {};
    const res: any = { locals: {} };
    const next = function (err: any) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req: any = { headers: { authorization: `Bearer ${badJwt}` } };
    const res: any = { locals: {} };
    const next = function (err: any) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req: any = {};
    const res: any = { locals: { user: { id: USER_ID } } };
    const next = function (err: any) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req: any = {};
    const res: any = { locals: {} };
    const next = function (err: any) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureCorrectUser", function () {
  test("works", function () {
    expect.assertions(1);
    const req: any = { params: { id: USER_ID } };
    const res: any = { locals: { user: { id: USER_ID } } };
    const next = function (err: any) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUser(req, res, next);
  });

  test("id doesn't match", function () {
    expect.assertions(3);
    const req: any = { params: { id: USER_ID } };
    const res: any = { locals: { user: { id: 0 } } };
    const next = function (err: any) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
      expect(err.status).toEqual(401);
      expect(err.message).toEqual("Unauthorized");
    };

    ensureCorrectUser(req, res, next);
  });
});
