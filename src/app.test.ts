import request from "supertest";
import app from "./app";
import { db } from "./db";

test("not found for site 404", async function () {
  const res = await request(app).get("/no-such-path");
  expect(res.statusCode).toEqual(404);
});

test("not found for site 404 (test stack print)", async function () {
  process.env.NODE_ENV = "";
  const res = await request(app).get("/no-such-path");
  expect(res.statusCode).toEqual(404);
  delete process.env.NODE_ENV;
});

test("error should be handled", async () => {
  const defaultErrorHandler = jest.fn((err, req, res, next) => {});

  app.use(defaultErrorHandler);
  const res = await request(app).get("/no-such-path");

  expect(res.status).toEqual(404);
  expect(defaultErrorHandler).not.toHaveBeenCalled();
});

afterAll(function () {
  db.end();
});
