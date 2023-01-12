import request from "supertest";
import app from "../app";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUsers,
  testMessageIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*********************************************************** GET /message/:id */

describe("GET /message", function () {
  test("gets a message by id if the user is recipient", async function () {
    const res = await request(app)
      .get(`/message/${testMessageIds[0]}`)
      .set("authorization", `Bearer ${testUsers[0].token}`);
    expect(res.body).toEqual({
      message: {
        id: testMessageIds[0],
        fromUser: {
          id: testUsers[1].id,
          firstName: "U2F",
          lastName: "U2L",
          avatar: "test_url2",
        },
        toUser: {
          id: testUsers[0].id,
          firstName: "U1F",
          lastName: "U1L",
          avatar: "test_url1",
        },
        body: "hello u1",
        sentAt: expect.any(String),
        readAt: null,
      },
    });
  });

  test("gets a message by id if the user is sender", async function () {
    const res = await request(app)
      .get(`/message/${testMessageIds[0]}`)
      .set("authorization", `Bearer ${testUsers[1].token}`);
    expect(res.body).toEqual({
      message: {
        id: testMessageIds[0],
        fromUser: {
          id: testUsers[1].id,
          firstName: "U2F",
          lastName: "U2L",
          avatar: "test_url2",
        },
        toUser: {
          id: testUsers[0].id,
          firstName: "U1F",
          lastName: "U1L",
          avatar: "test_url1",
        },
        body: "hello u1",
        sentAt: expect.any(String),
        readAt: null,
      },
    });
  });

  test("throws unauth if user is not sender or recipient", async function () {
    const res = await request(app)
      .get(`/message/${testMessageIds[0]}`)
      .set("authorization", `Bearer ${testUsers[2].token}`);
      expect(res.statusCode).toEqual(401);
  });

  test("throws notfound if no message", async function () {
    const res = await request(app)
      .get("/message/0")
      .set("authorization", `Bearer ${testUsers[2].token}`);
      expect(res.statusCode).toEqual(404);
  });
});
