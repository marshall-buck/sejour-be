import request from "supertest";
import app from "../app";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUsers,
  testPropertyIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /property */

describe("POST /property", function () {
  test("creates property", async function () {
    const res = await request(app)
      .post("/property")
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({
        title: "Prop test",
        street: "street test",
        city: "city test",
        state: "state test",
        zipcode: "77019",
        description: "description test",
        price: 200,
      });

    expect(res.body).toEqual({
      property: {
        id: expect.any(Number),
        title: "Prop test",
        street: "street test",
        city: "city test",
        state: "state test",
        zipcode: "77019",
        ownerId: testUsers[0].id,
        description: "description test",
        latitude: "-100.234234234",
        longitude: "50.234234234",
        price: 200,
      },
    });
  });

  test("user not logged in", async function () {
    const res = await request(app).post("/property").send({
      title: "Prop test",
      street: "street test",
      city: "city test",
      state: "state test",
      zipcode: "77019",
      description: "description test",
      price: 200,
    });
    expect(res.statusCode).toEqual(401);
  });

  test("missing input", async function () {
    const res = await request(app)
      .post("/property")
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({
        title: "Prop test",
        street: "street test",
        city: "city test",
        state: "state test",
        zipcode: "77019",
        description: "description test",
      });
    expect(res.statusCode).toEqual(400);
  });
});
