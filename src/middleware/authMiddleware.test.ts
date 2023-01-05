import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../expressError";
import {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
} from "./authMiddleware";

import { SECRET_KEY } from "../config";
const testJwt = jwt.sign({ id: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ id: "test", isAdmin: false }, "wrong");

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
        id: "test",
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
    const res: any = { locals: { user: { id: "test" } } };
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
    const req: any = { params: { id: "test" } };
    const res: any = { locals: { user: { id: "test" } } };
    const next = function (err: any) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUser(req, res, next);
  });

  test("id doesn't match", function () {
    expect.assertions(3);
    const req: any = { params: { id: "test" } };
    const res: any = { locals: { user: { id: "bad user" } } };
    const next = function (err: any) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
      expect(err.status).toEqual(401);
      expect(err.message).toEqual("Unauthorized");
    };

    ensureCorrectUser(req, res, next);
  });
});
