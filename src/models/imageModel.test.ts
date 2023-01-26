import { db } from "../db";
import { NotFoundError } from "../expressError";
import { Image } from "./imageModel";

import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  imageIds,
  propertyIds,
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

/************************************** create */

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

/************************************** delete */

describe("delete image", function () {
  test("deletes image from db", async function () {
    const result = await db.query(`
        SELECT image_key AS "imageKey"
          FROM images
            WHERE id = ${imageIds[0]}`);
    const imageKey = result.rows[0].imageKey;
    await Image.delete({ imageKey });
    const images = await db.query(`
        SELECT id
          FROM images
            WHERE id = ${imageIds[0]}`);
    expect(images.rows).toEqual([]);
  });

  test("throws not found if no such image", async function () {
    try {
      await Image.delete({ imageKey: "0"});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});

/************************************** update */

describe("update isCoverImage image", function () {
  test("update works as expected", async function () {
    const updatedImage = await Image.update({
      id: imageIds[1],
      propertyId: propertyIds[0],
    });
    expect(updatedImage.isCoverImage).toBeTruthy();

    const images = await db.query(`SELECT id, is_cover_image AS "isCoverImage"
                                      FROM images
                                          WHERE id = ${imageIds[0]}`);
    expect(updatedImage.isCoverImage).toBeTruthy();
    expect(images.rows[0].isCoverImage).toEqual(false);
  });

  test("throws not found if no such image", async function () {
    try {
      await Image.update({ id: 0, propertyId: propertyIds[0] });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});
