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

/************************************** GET /property */

describe("GET /property", function () {
  test("get all properties", async function () {
    const res = await request(app).get("/property");
    expect(res.body).toEqual({
      properties: {
        pagination: {
          currentPage: 1,
          limit: 12,
          totalPages: 1,
          totalResults: 2,
        },
        properties: [
          {
            id: expect.any(Number),
            title: "Prop 1",
            street: "street 1",
            city: "city 1",
            state: "state 1",
            zipcode: "zipcode 1",
            ownerId: testUsers[0].id,
            description: "description 1",
            price: 100,
            latitude: "-100.234234234",
            longitude: "50.234234234",
            images: [],
          },
          {
            id: expect.any(Number),
            title: "Prop 2",
            street: "street 2",
            city: "city 2",
            state: "state 2",
            zipcode: "zipcode 2",
            ownerId: testUsers[0].id,
            description: "description 2",
            price: 200,
            latitude: "-100.234234234",
            longitude: "50.234234234",
            images: [],
          },
        ],
      },
    });
  });

  test("get properties by minPrice", async function () {
    const res = await request(app).get("/property").query({
      minPrice: 101,
    });
    expect(res.body).toEqual({
      properties: {
        pagination: {
          currentPage: 1,
          limit: 12,
          totalPages: 1,
          totalResults: 1,
        },
        properties: [
          {
            id: expect.any(Number),
            title: "Prop 2",
            street: "street 2",
            city: "city 2",
            state: "state 2",
            zipcode: "zipcode 2",
            ownerId: testUsers[0].id,
            description: "description 2",
            price: 200,
            latitude: "-100.234234234",
            longitude: "50.234234234",
            images: [],
          },
        ],
      },
    });
  });

  test("get properties by maxPrice", async function () {
    const res = await request(app).get("/property").query({
      maxPrice: 101,
    });
    expect(res.body).toEqual({
      properties: {
        pagination: {
          currentPage: 1,
          limit: 12,
          totalPages: 1,
          totalResults: 1,
        },
        properties: [
          {
            id: expect.any(Number),
            title: "Prop 1",
            street: "street 1",
            city: "city 1",
            state: "state 1",
            zipcode: "zipcode 1",
            ownerId: testUsers[0].id,
            description: "description 1",
            price: 100,
            latitude: "-100.234234234",
            longitude: "50.234234234",
            images: [],
          },
        ],
      },
    });
  });

  test("get properties by description", async function () {
    const res = await request(app).get("/property").query({
      description: "description 1",
    });
    expect(res.body).toEqual({
      properties: {
        pagination: {
          currentPage: 1,
          limit: 12,
          totalPages: 1,
          totalResults: 1,
        },
        properties: [
          {
            id: expect.any(Number),
            title: "Prop 1",
            street: "street 1",
            city: "city 1",
            state: "state 1",
            zipcode: "zipcode 1",
            ownerId: testUsers[0].id,
            description: "description 1",
            price: 100,
            latitude: "-100.234234234",
            longitude: "50.234234234",
            images: [],
          },
        ],
      },
    });
  });

  test("get properties by pagination limit", async function () {
    const res = await request(app).get("/property").query({
      limit: 1,
    });
    expect(res.body).toEqual({
      properties: {
        pagination: {
          currentPage: 1,
          limit: 1,
          totalPages: 2,
          totalResults: 2,
        },
        properties: [
          {
            id: expect.any(Number),
            title: "Prop 1",
            street: "street 1",
            city: "city 1",
            state: "state 1",
            zipcode: "zipcode 1",
            ownerId: testUsers[0].id,
            description: "description 1",
            price: 100,
            latitude: "-100.234234234",
            longitude: "50.234234234",
            images: [],
          },
        ],
      },
    });
  });

  test("get properties by pagination page size", async function () {
    const res = await request(app).get("/property").query({
      limit: 1,
      pageNumber: 2,
    });
    expect(res.body).toEqual({
      properties: {
        pagination: {
          currentPage: 2,
          limit: 1,
          totalPages: 2,
          totalResults: 2,
        },
        properties: [
          {
            id: expect.any(Number),
            title: "Prop 2",
            street: "street 2",
            city: "city 2",
            state: "state 2",
            zipcode: "zipcode 2",
            ownerId: testUsers[0].id,
            description: "description 2",
            price: 200,
            latitude: "-100.234234234",
            longitude: "50.234234234",
            images: [],
          },
        ],
      },
    });
  });

  test("get by multiple params returning no results", async function () {
    const res = await request(app).get("/property").query({
      minPrice: 201,
      maxPrice: 300,
      description: "pool",
      limit: 1,
    });
    expect(res.body).toEqual({
      properties: {
        pagination: {
          currentPage: 1,
          limit: 1,
          totalPages: 0,
          totalResults: 0,
        },
        properties: [],
      },
    });
  });

  test("get by invalid params throws error", async function () {
    const res = await request(app).get("/property").query({
      hostname: "Marshall",
    });
    expect(res.statusCode).toEqual(400);
  });

  test("get by invalid params throws error", async function () {
    const res = await request(app).get("/property").query({
      maxPrice: "Marshall",
    });
    expect(res.statusCode).toEqual(400);
  });
});

/********************************************************* POST /property/id/ */

describe("POST /property/id/", function () {
  test("create a new booking", async function () {
    const res = await request(app)
      .post(`/property/${testPropertyIds[0]}/`)
      .set("authorization", `Bearer ${testUsers[1].token}`)
      .send({
        startDate: "2022-12-30T05:00:00.000Z",
        endDate: "2022-12-31T05:00:00.000Z",
      });
    expect(res.body).toEqual({
      booking: {
        id: expect.any(Number),
        startDate: "2022-12-30T05:00:00.000Z",
        endDate: "2022-12-31T05:00:00.000Z",
        guestId: testUsers[1].id,
        property: {
          id: testPropertyIds[0],
          title: "Prop 1",
          street: "street 1",
          city: "city 1",
          state: "state 1",
          zipcode: "zipcode 1",
          latitude: "-100.234234234",
          longitude: "50.234234234",
          ownerId: testUsers[0].id,
          description: "description 1",
          price: 100,
          images: [],
        },
      },
    });
  });

  test("new booking overlaps ", async function () {
    const res1 = await request(app)
      .post(`/property/${testPropertyIds[0]}/`)
      .set("authorization", `Bearer ${testUsers[1].token}`)
      .send({
        startDate: "2022-12-30T05:00:00.000Z",
        endDate: "2022-12-31T05:00:00.000Z",
      });
    const res2 = await request(app)
      .post(`/property/${testPropertyIds[0]}/`)
      .set("authorization", `Bearer ${testUsers[1].token}`)
      .send({
        startDate: "2022-12-30T05:00:00.000Z",
        endDate: "2022-12-31T05:00:00.000Z",
      });
    expect(res2.statusCode).toEqual(400);
  });

  test("owner can't book own property", async function () {
    const res = await request(app)
      .post(`/property/${testPropertyIds[0]}/`)
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({
        startDate: "2022-12-30T05:00:00.000Z",
        endDate: "2022-12-31T05:00:00.000Z",
      });

    expect(res.statusCode).toEqual(400);
  });

  test("unauth throws error", async function () {
    const res = await request(app)
      .post(`/property/${testPropertyIds[0]}/`)
      .send({
        startDate: "2022-12-30T05:00:00.000Z",
        endDate: "2022-12-31T05:00:00.000Z",
      });

    expect(res.statusCode).toEqual(401);
  });
});

/********************************************************* GET /property/id/ */
describe("GET /property/id/", function () {
  test("Can get property by id", async function () {
    const res = await request(app).get(`/property/${testPropertyIds[1]}`);

    expect(res.body).toEqual({
      property: {
        id: expect.any(Number),
        title: "Prop 2",
        street: "street 2",
        city: "city 2",
        state: "state 2",
        zipcode: "zipcode 2",
        ownerId: testUsers[0].id,
        description: "description 2",
        price: 200,
        latitude: "-100.234234234",
        longitude: "50.234234234",
        images: [],
      },
    });
  });
  test("Invalid throws error", async function () {
    const res = await request(app).get(`/property/0`);

    expect(res.statusCode).toEqual(404);
  });
});
