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

import { google } from "../helpers/geocoding";
import {
  AddressType,
  GeocodeResponse,
  GeocodeResult,
} from "@googlemaps/google-maps-services-js";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const mockGeocodeService = jest.spyOn(google, "geocode");

// Mock API response for geocode method to google client for testing purposes
const mockGoogleResponse = [
  {
    types: ["geocode"] as AddressType[],
    formatted_address: "",
    address_components: {
      short_name: "",
      long_name: "",
      postcode_localities: "",
      types: "",
    },
    partial_match: true,
    place_id: "",
    postcode_localities: "",
    geometry: {
      location: { lat: 123456789, lng: 123456789 },
      location_type: "GeocoderLocationType",
      viewport: { lat: 123456789, lng: 123456789 },
      bounds: { lat: 123456789, lng: 123456789 },
    },
  },
] as unknown as GeocodeResult[];

afterEach(() => jest.clearAllMocks);

/************************************** POST /property */

describe("POST /property", function () {
  test("creates property", async function () {
    mockGeocodeService.mockResolvedValue({
      data: { results: mockGoogleResponse },
    } as GeocodeResponse);

    const res = await request(app)
      .post("/property")
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({
        title: "prop test",
        street: "357 w 30th",
        city: "new york",
        state: "new york",
        zipcode: "10001",
        description: "description test",
        price: 200,
      });
    expect(res.body).toEqual({
      property: {
        id: expect.any(Number),
        title: "prop test",
        street: "357 w 30th",
        city: "new york",
        state: "new york",
        zipcode: "10001",
        ownerId: testUsers[0].id,
        description: "description test",
        latitude: "123456789",
        longitude: "123456789",
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
            latitude: "123.123123",
            longitude: "-123.123123",
            images: [
              {
                id: expect.any(Number),
                imageKey: expect.any(String),
                isCoverImage: true,
              },
              {
                id: expect.any(Number),
                imageKey: expect.any(String),
                isCoverImage: false,
              },
            ],
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
            latitude: "-123.123123",
            longitude: "123.123123",
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
            latitude: "-123.123123",
            longitude: "123.123123",
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
            latitude: "123.123123",
            longitude: "-123.123123",
            images: [
              {
                id: expect.any(Number),
                imageKey: expect.any(String),
                isCoverImage: true,
              },
              {
                id: expect.any(Number),
                imageKey: expect.any(String),
                isCoverImage: false,
              },
            ],
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
            latitude: "123.123123",
            longitude: "-123.123123",
            images: [
              {
                id: expect.any(Number),
                imageKey: expect.any(String),
                isCoverImage: true,
              },
              {
                id: expect.any(Number),
                imageKey: expect.any(String),
                isCoverImage: false,
              },
            ],
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
            latitude: "123.123123",
            longitude: "-123.123123",
            images: [
              {
                id: expect.any(Number),
                imageKey: expect.any(String),
                isCoverImage: true,
              },
              {
                id: expect.any(Number),
                imageKey: expect.any(String),
                isCoverImage: false,
              },
            ],
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
            latitude: "-123.123123",
            longitude: "123.123123",
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
          latitude: "123.123123",
          longitude: "-123.123123",
          ownerId: testUsers[0].id,
          description: "description 1",
          price: 100,
          images: [
            {
              id: expect.any(Number),
              imageKey: expect.any(String),
              isCoverImage: true,
            },
            {
              id: expect.any(Number),
              imageKey: expect.any(String),
              isCoverImage: false,
            },
          ],
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
  // geocodeMockSetup;
  test("can get property by id", async function () {
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
        latitude: "-123.123123",
        longitude: "123.123123",
        images: [],
      },
    });
  });
  test("Invalid throws error", async function () {
    const res = await request(app).get(`/property/0`);

    expect(res.statusCode).toEqual(404);
  });
});

/******************************************************** PATCH /property/id/ */
describe("PATCH /property/id/", function () {
  test("can update a property by title", async function () {
    const res = await request(app)
      .patch(`/property/${testPropertyIds[1]}`)
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({
        title: "NEW prop 2",
        description: "NEW description 2",
        price: 999,
      });
    expect(res.body).toEqual({
      property: {
        id: expect.any(Number),
        title: "NEW prop 2",
        street: "street 2",
        city: "city 2",
        state: "state 2",
        zipcode: "zipcode 2",
        ownerId: testUsers[0].id,
        description: "NEW description 2",
        price: 999,
        latitude: "-123.123123",
        longitude: "123.123123",
      },
    });
  });

  test("throws Unauthorized if userId not ownerId", async function () {
    const res = await request(app)
      .patch(`/property/${testPropertyIds[1]}`)
      .set("authorization", `Bearer ${testUsers[1].token}`)
      .send({ title: "NEW prop 2" });
    expect(res.statusCode).toEqual(401);
  });

  test("throws BadRequest if invalid req data", async function () {
    const res = await request(app)
      .patch(`/property/${testPropertyIds[1]}`)
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({ ownerId: "new owner" });
    expect(res.statusCode).toEqual(400);
  });

  test("throws BadRequest if missing req data", async function () {
    const res = await request(app)
      .patch(`/property/${testPropertyIds[1]}`)
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({ title: "NEW prop 2" });
    expect(res.statusCode).toEqual(400);
  });

  test("throws NotFound if no property by propertyId", async function () {
    const res = await request(app)
      .patch("/property/0")
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({ title: "NEW prop 2" });
    expect(res.statusCode).toEqual(404);
  });
});

/******************************************************* DELETE /property/id/ */
describe("DELETE /property/id/", function () {
  test("can archive a property by id", async function () {
    const res = await request(app)
      .delete(`/property/${testPropertyIds[1]}`)
      .set("authorization", `Bearer ${testUsers[0].token}`);
    expect(res.body).toEqual({
      message: `Successfully archived Property ${testPropertyIds[1]}`,
    });
  });

  test("throws NotFound if no property found by id", async function () {
    const res = await request(app)
      .delete("/property/0")
      .set("authorization", `Bearer ${testUsers[0].token}`);
    expect(res.statusCode).toEqual(404);
  });

  test("throws Unauthorized if userId not ownerId", async function () {
    const res = await request(app)
      .delete(`/property/${testPropertyIds[1]}`)
      .set("authorization", `Bearer ${testUsers[1].token}`);
    expect(res.statusCode).toEqual(401);
  });
});
