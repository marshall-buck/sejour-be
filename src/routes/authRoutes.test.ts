import request from "supertest";
import app from "../app";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/login */

describe("POST /auth/login", function () {
  test("works", async function () {
    const resp = await request(app).post("/auth/login").send({
      id: "u1",
      password: "password1",
    });
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth with non-existent user", async function () {
    const resp = await request(app).post("/auth/login").send({
      id: "no-such-user",
      password: "password1",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth with wrong password", async function () {
    const resp = await request(app).post("/auth/login").send({
      id: "u1",
      password: "nope",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app).post("/auth/login").send({
      id: "u1",
    });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app).post("/auth/login").send({
      id: 42,
      password: "above-is-a-number",
    });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** POST /auth/register */

describe("POST /auth/register", function () {
  test("works", async function () {
    const resp = await request(app).post("/auth/register").send({
      id: "new_user",
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "new@email.com",
      avatar: "avatar_url",
    });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("bad request with missing fields", async function () {
    const resp = await request(app).post("/auth/register").send({
      id: "new",
    });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app).post("/auth/register").send({
      id: "new",
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "not-an-email",
      avatar: "avatar_url",
    });
    expect(resp.statusCode).toEqual(400);
  });
});
