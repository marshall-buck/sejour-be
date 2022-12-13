"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db");
const Property = require("./propertyModel");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds

} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {


  test("works", async function () {
    let newProperty = {
      title: '1sdfsdf',
      address: '12123',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam, rerum.',
      price: 200,
      ownerUsername: 'u1'

    };
    let property = await Property.create(newProperty);

    expect(property).toEqual({
      ...newProperty,
      id: expect.any(Number),
    });
  });


});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let properties = await Property.findAll();
    expect(properties).toEqual([
      {
        id: expect.any(Number),
        title: "one",
        address: "123 lane",
        description: "blah blah blah yard",
        price: 100,
        ownerUsername: "u1"
      },
      {
        id: expect.any(Number),
        title: "two",
        address: "long drive",
        description: "pool, jacuzzi, movie theatre",
        price: 300,
        ownerUsername: "u2"
      },

    ]);
  });

  test("works: by min price", async function () {
    let properties = await Property.findAll({ minPrice: 250 });
    expect(properties).toEqual([
      {
        id: expect.any(Number),
        title: "two",
        address: "long drive",
        description: "pool, jacuzzi, movie theatre",
        price: 300,
        ownerUsername: "u2"
      }
    ]);
  });



  test("works: by max price", async function () {
    let properties = await Property.findAll({ maxPrice: 200 });
    expect(properties).toEqual([
      {
        id: expect.any(Number),
        title: "one",
        address: "123 lane",
        description: "blah blah blah yard",
        price: 100,
        ownerUsername: "u1"
      },
    ]);
  });

  test("works: by description", async function () {
    let properties = await Property.findAll({ description: "pool" });
    expect(properties).toEqual([
      {
        id: expect.any(Number),
        title: "two",
        address: "long drive",
        description: "pool, jacuzzi, movie theatre",
        price: 300,
        ownerUsername: "u2"
      },
    ]);
  });
});


/************************************** get */

describe("get by id", function () {
  test("works by id", async function () {
    let property = await Property.get(propertyIds[0]);
    expect(property).toEqual(
      {
        id: propertyIds[0],
        title: "one",
        address: "123 lane",
        description: "blah blah blah yard",
        price: 100,
        ownerUsername: "u1"
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