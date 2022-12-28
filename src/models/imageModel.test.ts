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
