import { NotFoundError } from "../expressError";
import { Property } from "./propertyModel";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  test("works: create method creates new property", async function () {
    let newProperty = {
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
    let property = await Property.create(newProperty);

    expect(property).toEqual({
      ...newProperty,
      latitude: "-100.234234234",
      longitude: "50.234234234",

      id: expect.any(Number),
    });
  });
});

/************************************** findAll */
// TODO: refactor with images
describe("findAll", function () {
  test("works: no filter no images on property", async function () {
    let properties = await Property.findAll();
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
        key: null,
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
        key: null,
      },
    ]);
  });

  test("works: filters by min price", async function () {
    let properties = await Property.findAll({ minPrice: 150 });
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
        key: null,
      },
    ]);
  });

  test("works: filters by max price", async function () {
    let properties = await Property.findAll({ maxPrice: 150 });
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
        key: null,
      },
    ]);
  });

  test("works: filters by description", async function () {
    let properties = await Property.findAll({ description: "pool" });
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
        key: null,
      },
    ]);
  });
});

/************************************** get */

describe("get by id", function () {
  test("works get property by id", async function () {
    const id = propertyIds[0] as number;
    let property = await Property.get(id);
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
      images: [],
    });
  });

  test("not found if no such property", async function () {
    try {
      await Property.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
