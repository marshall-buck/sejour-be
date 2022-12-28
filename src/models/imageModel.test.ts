import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from "../expressError";
import { Image } from "./imageModel";
import { db } from "../db";

import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds,
  imageIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** getAllByProperty */

describe("getAllByProperty", function () {
  test("returns results", async function () {
    const images = await Image.getAllByProperty(propertyIds[0]);

    expect(images).toEqual([
      { id: expect.any(Number), imageKey: "12345678", isCoverImage: true },
      { id: expect.any(Number), imageKey: "23456789", isCoverImage: false },
      { id: expect.any(Number), imageKey: "34567890", isCoverImage: false },
    ]);
  });

  test("returns no images", async function () {
    const images = await Image.getAllByProperty(propertyIds[1]);
    expect(images).toEqual([]);
  });

  test("throws NotFoundError when no property exists", async function () {
    try {
      await Image.getAllByProperty(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});
describe("create image", function () {
  test("adds image to db", async function () {
    const images = await Image.create({
      imageKey: "test 1",
      propertyId: propertyIds[0],
    });

    expect(images).toEqual({
      id: expect.any(Number),
      imageKey: "test 1",
      propertyId: propertyIds[0],
      isCoverImage: false,
    });
  });
});

describe("delete image", function () {
  test("deletes image from db", async function () {
    await Image.delete(imageIds[0]);
    const images = await db.query(`SELECT id
                              FROM images
                                WHERE id = ${imageIds[0]}`);

    expect(images.rows).toEqual([]);
  });

  test("throws not found if no such image", async function () {
    try {
      await Image.delete(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});
