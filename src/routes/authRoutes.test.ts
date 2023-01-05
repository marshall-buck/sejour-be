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
    const res = await request(app).post("/auth/login").send({
      email: "user1@user.com",
      password: "password1",
    });
    expect(res.body).toEqual({
      token: expect.any(String),
    });
  });

  test("unauth with non-existent user", async function () {
    const res = await request(app).post("/auth/login").send({
      email: "baduser@user.com",
      password: "password1",
    });
    expect(res.statusCode).toEqual(401);
  });

  test("unauth with wrong password", async function () {
    const res = await request(app).post("/auth/login").send({
      email: "user1@user.com",
      password: "nope1234",
    });
    expect(res.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const res = await request(app).post("/auth/login").send({
      email: "user1@user.com",
    });
    expect(res.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const res = await request(app).post("/auth/login").send({
      email: 42,
      password: "above-is-a-number",
    });
    expect(res.statusCode).toEqual(400);
  });
});

/************************************** POST /auth/register */

describe("POST /auth/register", function () {
  test("works", async function () {
    const res = await request(app).post("/auth/register").send({
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "new@email.com",
      avatar: "avatar_url",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      token: expect.any(String),
    });
  });

  test("bad request with missing fields", async function () {
    const res = await request(app).post("/auth/register").send({
      email: "new@email.com",
    });
    expect(res.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const res = await request(app).post("/auth/register").send({
      firstName: "first",
      lastName: "last",
      password: "password",
      email: "not-an-email",
      avatar: "avatar_url",
    });
    expect(res.statusCode).toEqual(400);
  });
});
