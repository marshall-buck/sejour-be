import request from "supertest";
import app from "./app";
import { db } from "./db";

test("not found for site 404", async function () {
  const res = await request(app).get("/no-such-path");
  expect(res.statusCode).toEqual(404);
});

test("not found for site 404 (test stack print)", async function () {
  const res = await request(app).get("/no-such-path");
  expect(res.statusCode).toEqual(404);
});

afterAll(function () {
  db.end();
});
