import request from "supertest";
import app from "../app";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUserIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /user/id */

describe("GET /user/id", function () {
  test("works", async function () {
    const res = await request(app)
      .get(`/user/${testUserIds[0].id}`)
      .set("authorization", `Bearer ${testUserIds[0].token}`);
    expect(res.body).toEqual({
      user: {
        id: testUserIds[0].id,
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        isAdmin: false,
        avatar: "test_url1",
      },
    });
  });
  test("unauth for other users", async function () {
    const res = await request(app)
      .get(`/user/${testUserIds[0].id}`)
      .set("authorization", "Bearer INVALID_TOKEN");
    expect(res.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const res = await request(app).get(`/user/${testUserIds[0].id}`);
    expect(res.statusCode).toEqual(401);
  });
});

/************************************** GET /user/id/messages-to */

describe("GET /user/id/messages-to", function () {
  test("works", async function () {
    const res = await request(app)
      .get(`/user/${testUserIds[0].id}/messages-to`)
      .set("authorization", `Bearer ${testUserIds[0].token}`);
    expect(res.body).toEqual({
      messages: [
        {
          id: expect.any(Number),
          body: "hello u1",
          sentAt: expect.any(String),
          readAt: null,
          fromUser: {
            id: testUserIds[1].id,
            firstName: "U2F",
            lastName: "U2L",
            avatar: "test_url2",
          },
        },
      ],
    });
  });
  test("unauth for other users", async function () {
    const res = await request(app)
      .get(`/user/${testUserIds[0].id}/messages-to`)
      .set("authorization", "Bearer INVALID_TOKEN");
    expect(res.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const res = await request(app).get(
      `/user/${testUserIds[0].id}/messages-to`
    );
    expect(res.statusCode).toEqual(401);
  });
});

/************************************** GET /user/id/messages-from */

describe("GET /user/id/messages-from", function () {
  test("works", async function () {
    const res = await request(app)
      .get(`/user/${testUserIds[0].id}/messages-from`)
      .set("authorization", `Bearer ${testUserIds[0].token}`);
    expect(res.body).toEqual({
      messages: [
        {
          id: expect.any(Number),
          body: "hello u2",
          sentAt: expect.any(String),
          readAt: null,
          toUser: {
            id: testUserIds[1].id,
            firstName: "U2F",
            lastName: "U2L",
            avatar: "test_url2",
          },
        },
      ],
    });
  });
  test("unauth for other users", async function () {
    const res = await request(app)
      .get(`/user/${testUserIds[0].id}/messages-from`)
      .set("authorization", "Bearer INVALID_TOKEN");
    expect(res.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const res = await request(app).get(
      `/user/${testUserIds[0].id}/messages-from`
    );
    expect(res.statusCode).toEqual(401);
  });
});

/************************************** PATCH /user/id/ */

describe("PATCH /user/id/", function () {
  test("update firstName or lastName works", async function () {
    const res = await request(app)
      .patch(`/user/${testUserIds[0].id}`)
      .set("authorization", `Bearer ${testUserIds[0].token}`)
      .send({
        firstName: "firstNew",
        lastName: "lastNew",
      });
    expect(res.body).toEqual({
      user: {
        id: testUserIds[0].id,
        firstName: "firstNew",
        lastName: "lastNew",
        email: "user1@user.com",
        isAdmin: false,
        avatar: "test_url1",
      },
    });
  });

  test("update email works", async function () {
    const res = await request(app)
      .patch(`/user/${testUserIds[0].id}`)
      .set("authorization", `Bearer ${testUserIds[0].token}`)
      .send({
        email: "user1new@user.com",
      });
    expect(res.body).toEqual({
      user: {
        id: testUserIds[0].id,
        firstName: "U1F",
        lastName: "U1L",
        email: "user1new@user.com",
        isAdmin: false,
        avatar: "test_url1",
      },
    });
  });

  test("update firstName, lastName and email works", async function () {
    const res = await request(app)
      .patch(`/user/${testUserIds[0].id}`)
      .set("authorization", `Bearer ${testUserIds[0].token}`)
      .send({
        firstName: "firstNew",
        lastName: "lastNew",
        email: "newb@newb.com",
      });
    expect(res.body).toEqual({
      user: {
        id: testUserIds[0].id,
        firstName: "firstNew",
        lastName: "lastNew",
        email: "newb@newb.com",
        isAdmin: false,
        avatar: "test_url1",
      },
    });
  });
  test("validator works", async function () {
    const res = await request(app)
      .patch(`/user/${testUserIds[0].id}`)
      .set("authorization", `Bearer ${testUserIds[0].token}`)
      .send({
        firstName: "firstNew",
        lastName: "lastNew",
        email: "newbnewb.com",
      });
    expect(res.statusCode).toEqual(400);
  });

  test("unauth for other users", async function () {
    const res = await request(app)
      .patch(`/user/${testUserIds[0].id}`)
      .set("authorization", `invalidToken`)
      .send({
        email: "user1new@user.com",
      });
    expect(res.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const res = await request(app).patch(`/user/${testUserIds[0].id}`);
    expect(res.statusCode).toEqual(401);
  });

  test("throws error if user's email already exits", async function () {
    const res = await request(app)
      .patch(`/user/${testUserIds[0].id}`)
      .set("authorization", `Bearer ${testUserIds[0].token}`)
      .send({
        email: "user2@user.com",
      });
    expect(res.statusCode).toEqual(400);
  });
});
