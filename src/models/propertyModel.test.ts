import { db } from "../db";
import { BadRequestError, NotFoundError } from "../expressError";
import { Property } from "./propertyModel";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  propertyIds,
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
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam, rerum.",
      price: 200,
      ownerUsername: "u1",
    };
    const property = await Property.create(newProperty);

    expect(property).toEqual({
      ...newProperty,
      latitude: "-100.234234234",
      longitude: "50.234234234",

      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter finds all but exludes archived", async function () {
    const properties = await Property.findAll();
    expect(properties).toEqual([
      {
        id: expect.any(Number),
        title: "property one",
        street: "123 lane",
        city: "test city",
        state: "test state",
        zipcode: "11111",
        latitude: "180.0000000",
        longitude: "-180.0000000",
        description: "test description",
        price: 100,
        ownerUsername: "u1",
        images: [
          { id: expect.any(Number), imageKey: "12345678" },
          { id: expect.any(Number), imageKey: "23456789" },
          { id: expect.any(Number), imageKey: "34567890" },
        ],
      },
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
        ownerUsername: "u2",
        images: [],
      },
    ]);
  });

  test("pagination and page size works on search queries", async function () {
    const properties = await Property.findAll({ pageSize: 1 });
    expect(properties).toEqual([
      {
        id: expect.any(Number),
        title: "property one",
        street: "123 lane",
        city: "test city",
        state: "test state",
        zipcode: "11111",
        latitude: "180.0000000",
        longitude: "-180.0000000",
        description: "test description",
        price: 100,
        ownerUsername: "u1",
        images: [
          { id: expect.any(Number), imageKey: "12345678" },
          { id: expect.any(Number), imageKey: "23456789" },
          { id: expect.any(Number), imageKey: "34567890" },
        ],
      },
    ]);
  });

  test("page number works on search queries", async function () {
    const properties = await Property.findAll({ pageSize: 1, pageNumber: 2 });
    expect(properties).toEqual([
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
        ownerUsername: "u2",
        images: [],
      },
    ]);
  });

  test("works: filters by min price", async function () {
    const properties = await Property.findAll({ minPrice: 150 });
    expect(properties).toEqual([
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
        ownerUsername: "u2",
        images: [],
      },
    ]);
  });

  test("works: filters by max price", async function () {
    const properties = await Property.findAll({ maxPrice: 150 });
    expect(properties).toEqual([
      {
        id: expect.any(Number),
        title: "property one",
        street: "123 lane",
        city: "test city",
        state: "test state",
        zipcode: "11111",
        latitude: "180.0000000",
        longitude: "-180.0000000",
        description: "test description",
        price: 100,
        ownerUsername: "u1",
        images: [
          { id: expect.any(Number), imageKey: "12345678" },
          { id: expect.any(Number), imageKey: "23456789" },
          { id: expect.any(Number), imageKey: "34567890" },
        ],
      },
    ]);
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
    expect(properties).toEqual([
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
        ownerUsername: "u2",
        images: [],
      },
    ]);
  });
});

/************************************** get */

describe("get by id", function () {
  test("works get property by id", async function () {
    const id = propertyIds[0] as number;
    const property = await Property.get(id);
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
      ownerUsername: "u1",
      images: [
        { id: expect.any(Number), imageKey: "12345678" },
        { id: expect.any(Number), imageKey: "23456789" },
        { id: expect.any(Number), imageKey: "34567890" },
      ],
    });
  });

  test("not found if no such property", async function () {
    try {
      await Property.get(0);
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
      ownerUsername: "u1",
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
    await Property.delete(propertyIds[0]);
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

  test("not found if no such property", async function () {
    try {
      await Property.delete(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});
