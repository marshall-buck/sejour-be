import request from "supertest";
import app from "./app";
import { db } from "./db";
import { testUsers } from "./routes/_testCommon";

test("not found for site 404", async function () {
  const res = await request(app).get("/no-such-path");
  expect(res.statusCode).toEqual(404);
});

test("not found for site 404 (test stack print)", async function () {
  process.env.NODE_ENV = "";
  const res = await request(app).get("/no-such-path");
  expect(res.statusCode).toEqual(404);
  process.env.END
});

// TODO: figure out how to do this
// test("500 server error", async function () {
//   const res = await request(app)
//     .get("/message/$0")
//     .set("authorization", `Bearer ${testUsers[0].token}`);
//   expect(res.statusCode).toEqual(500);
// });

afterAll(function () {
  db.end();
});
