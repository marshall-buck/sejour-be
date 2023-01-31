import { db } from "../db";
import { BadRequestError, NotFoundError } from "../expressError";
import { Property } from "./propertyModel";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  propertyIds,
  userIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  test("works: create method creates new property", async function () {
    const newProperty = {
      title: "1sdfsdf",
      street: "12123 bobs your uncle",
      city: "New York",
      state: "NY",
      zipcode: "11111",
      latitude: "-100.234234234",
      longitude: "50.234234234",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam, rerum.",
      price: 200,
      ownerId: userIds[0],
    };
    const property = await Property.create(newProperty);

    expect(property).toEqual({
      ...newProperty,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter finds all but excludes archived", async function () {
    const properties = await Property.findAll({});
    expect(properties).toEqual({
      pagination: { currentPage: 1, limit: 12, totalPages: 1, totalResults: 2 },
      properties: [
        {
          city: "test city",
          description: "test description",
          id: expect.any(Number),
          images: [
            {
              id: expect.any(Number),
              imageKey: "12345678",
              isCoverImage: true,
            },
            {
              id: expect.any(Number),
              imageKey: "23456789",
              isCoverImage: false,
            },
            {
              id: expect.any(Number),
              imageKey: "34567890",
              isCoverImage: false,
            },
          ],
          latitude: "180.0000000",
          longitude: "-180.0000000",
          ownerId: userIds[0],
          price: 100,
          state: "test state",
          street: "123 lane",
          title: "property one",
          zipcode: "11111",
        },
        {
          city: "test city",
          description: "test description pool",
          id: expect.any(Number),
          images: [],
          latitude: "180.0000000",
          longitude: "-180.0000000",
          ownerId: userIds[1],
          price: 200,
          state: "test state",
          street: "123 lane",
          title: "property two",
          zipcode: "11111",
        },
      ],
    });
  });

  test("pagination and page size works on search queries", async function () {
    const properties = await Property.findAll({ limit: 1 });
    expect(properties).toEqual({
      pagination: { currentPage: 1, limit: 1, totalPages: 2, totalResults: 2 },
      properties: [
        {
          city: "test city",
          description: "test description",
          id: expect.any(Number),
          images: [
            {
              id: expect.any(Number),
              imageKey: "12345678",
              isCoverImage: true,
            },
            {
              id: expect.any(Number),
              imageKey: "23456789",
              isCoverImage: false,
            },
            {
              id: expect.any(Number),
              imageKey: "34567890",
              isCoverImage: false,
            },
          ],
          latitude: "180.0000000",
          longitude: "-180.0000000",
          ownerId: userIds[0],
          price: 100,
          state: "test state",
          street: "123 lane",
          title: "property one",
          zipcode: "11111",
        },
      ],
    });
  });

  test("page number works on search queries", async function () {
    const properties = await Property.findAll({ limit: 1, pageNumber: 2 });
    expect(properties).toEqual({
      pagination: {
        currentPage: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      },
      properties: [
        {
          city: "test city",
          description: "test description pool",
          id: expect.any(Number),
          images: [],
          latitude: "180.0000000",
          longitude: "-180.0000000",
          ownerId: userIds[1],
          price: 200,
          state: "test state",
          street: "123 lane",
          title: "property two",
          zipcode: "11111",
        },
      ],
    });
  });

  test("works: filters by min price", async function () {
    const properties = await Property.findAll({ minPrice: 150 });
    expect(properties).toEqual({
      pagination: { currentPage: 1, limit: 12, totalPages: 1, totalResults: 1 },
      properties: [
        {
          city: "test city",
          description: "test description pool",
          id: expect.any(Number),
          images: [],
          latitude: "180.0000000",
          longitude: "-180.0000000",
          ownerId: userIds[1],
          price: 200,
          state: "test state",
          street: "123 lane",
          title: "property two",
          zipcode: "11111",
        },
      ],
    });
  });

  test("works: filters by max price", async function () {
    const properties = await Property.findAll({ maxPrice: 150 });
    expect(properties).toEqual({
      pagination: { currentPage: 1, limit: 12, totalPages: 1, totalResults: 1 },
      properties: [
        {
          city: "test city",
          description: "test description",
          id: expect.any(Number),
          images: [
            {
              id: expect.any(Number),
              imageKey: "12345678",
              isCoverImage: true,
            },
            {
              id: expect.any(Number),
              imageKey: "23456789",
              isCoverImage: false,
            },
            {
              id: expect.any(Number),
              imageKey: "34567890",
              isCoverImage: false,
            },
          ],
          latitude: "180.0000000",
          longitude: "-180.0000000",
          ownerId: userIds[0],
          price: 100,
          state: "test state",
          street: "123 lane",
          title: "property one",
          zipcode: "11111",
        },
      ],
    });
  });

  test("throws an error if max price is < min price", async function () {
    try {
      await Property.findAll({ maxPrice: 150, minPrice: 200 });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      const errStatus = (err as BadRequestError).status;
      expect(errStatus).toEqual(400);
    }
  });

  test("works: filters by description", async function () {
    const properties = await Property.findAll({ description: "pool" });
    expect(properties).toEqual({
      properties: [
        {
          id: expect.any(Number),
          title: "property two",
          street: "123 lane",
          city: "test city",
          state: "test state",
          zipcode: "11111",
          latitude: "180.0000000",
          longitude: "-180.0000000",
          description: "test description pool",
          price: 200,
          ownerId: userIds[1],
          images: [],
        },
      ],
      pagination: {
        currentPage: 1,
        limit: 12,
        totalPages: 1,
        totalResults: 1,
      },
    });
  });
});

/************************************** get */

describe("get by id", function () {
  test("works get property by id", async function () {
    const property = await Property.get({ id: propertyIds[0] });
    expect(property).toEqual({
      id: propertyIds[0],
      title: "property one",
      street: "123 lane",
      city: "test city",
      state: "test state",
      zipcode: "11111",
      latitude: "180.0000000",
      longitude: "-180.0000000",
      description: "test description",
      price: 100,
      ownerId: userIds[0],
      images: [
        { id: expect.any(Number), imageKey: "12345678", isCoverImage: true },
        { id: expect.any(Number), imageKey: "23456789", isCoverImage: false },
        { id: expect.any(Number), imageKey: "34567890", isCoverImage: false },
      ],
    });
  });

  test("not found if no such property", async function () {
    try {
      await Property.get({ id: 0 });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});

/************************************** update */

describe("update", function () {
  test("can update a property", async function () {
    const updateProperty = {
      id: propertyIds[0],
      title: "updated title",
      description: "updated description",
      price: 1000,
    };
    const property = await Property.update(updateProperty);
    expect(property).toEqual({
      id: propertyIds[0],
      title: "updated title",
      street: "123 lane",
      city: "test city",
      state: "test state",
      zipcode: "11111",
      latitude: "180.0000000",
      longitude: "-180.0000000",
      description: "updated description",
      price: 1000,
      ownerId: userIds[0],
    });
  });

  test("not found if no such property", async function () {
    const updateProperty = {
      id: 0,
      title: "updated title",
      description: "updated description",
      price: 1000,
    };
    try {
      await Property.update(updateProperty);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});

/************************************** delete */

describe("delete", function () {
  test("archives a deleted property", async function () {
    await Property.delete({ id: propertyIds[0] });
    const property = await db.query(`
        SELECT archived, id
            FROM properties
                WHERE id = '${propertyIds[0]}'
    `);
    expect(property.rows[0]).toEqual({
      id: expect.any(Number),
      archived: true,
    });
  });

  test("throws not found if no such property", async function () {
    try {
      await Property.delete({ id: 0 });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});

/************************************** getOwnerId */

describe("getOwnerId", function () {
  test("finds a ownerId by propertyId", async function () {
    const ownerId = await Property.getOwnerId({ id: propertyIds[0] });
    expect(ownerId).toEqual({ownerId: userIds[0]});
  });

  test("throws not found if no such property", async function () {
    try {
      await Property.getOwnerId({ id: 0 });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});
