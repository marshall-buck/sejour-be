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

/************************************************************ PATCH /message/ */

describe("PATCH /message", function () {
  test("updates readAt for a message id", async function () {
    const res = await request(app)
      .patch(`/message/${testMessageIds[0]}`)
      .set("authorization", `Bearer ${testUsers[0].token}`)
    expect(res.body).toEqual({
      message: {
        id: expect.any(Number),
        readAt: expect.any(String)
      },
    });
  });

  test("throws unauth if no authenticated user", async function () {
    const res = await request(app)
      .patch(`/message/${testMessageIds[0]}`)
    expect(res.statusCode).toEqual(401);
  });

  test("throws unauth if no unauthorized user", async function () {
    const res = await request(app)
      .patch(`/message/${testMessageIds[0]}`)
      .set("authorization", `Bearer ${testUsers[2].token}`)
    expect(res.statusCode).toEqual(401);
  });

  test("throws not found if no message by id", async function () {
    const res = await request(app)
      .patch("/message/0")
      .set("authorization", `Bearer ${testUsers[0].token}`)
    expect(res.statusCode).toEqual(404);
  });
});

/************************************************************* POST /message/ */

describe("POST /message", function () {
  test("creates a new message", async function () {
    const res = await request(app)
      .post("/message/")
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({ toId: testUsers[1].id, body: "new message" });
    expect(res.body).toEqual({
      message: {
        id: expect.any(Number),
        fromId: testUsers[0].id,
        toId: testUsers[1].id,
        body: "new message",
        sentAt: expect.any(String),
      },
    });
  });

  test("throws unauth if no authenticated user", async function () {
    const res = await request(app)
      .post("/message/")
      .send({ toId: testUsers[1], body: "new message" });
    expect(res.statusCode).toEqual(401);
  });

  test("throws bad request if invalid input", async function () {
    const res = await request(app)
      .post("/message/")
      .set("authorization", `Bearer ${testUsers[2].token}`)
      .send({ toId: testUsers[1] });
    expect(res.statusCode).toEqual(400);
  });
});
