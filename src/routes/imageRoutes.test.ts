import { ExistingObjectReplicationFilterSensitiveLog } from "@aws-sdk/client-s3";
import { executionAsyncId } from "node:async_hooks";
import request from "supertest";
import app from "../app";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testPropertyIds,
  testUsers,
  testImageIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*************************************************** POST /property/:id/image */
/************************************************* DELETE /property/:id/image */
/***************************************** PATCH /property/:id/image/:imageId */

describe("PATCH /property/:id/image/imageId", function () {
  test("updates an image correctly", async function () {
    const res = await request(app)
      .patch(`/property/${testPropertyIds[0]}/image/${testImageIds[1]}`)
      .set("authorization", `Bearer ${testUsers[0].token}`);
    expect(res.body).toEqual({
      image: {
        id: testImageIds[1],
        imageKey: expect.any(String),
        propertyId: testPropertyIds[0],
        isCoverImage: true,
      },
    });
  });

  test("blocks if user is not authenticated", async function () {
    const res = await request(app).patch(
      `/property/${testPropertyIds[0]}/image/${testImageIds[0]}`
    );
    expect(res.statusCode).toEqual(401);
  });

  test("blocks if user is not authorized/property owner", async function () {
    const res = await request(app)
      .patch(`/property/${testPropertyIds[0]}/image/${testImageIds[0]}`)
      .set("authorization", `Bearer ${testUsers[1].token}`);
    expect(res.statusCode).toEqual(401);
  });
});

/*************************************************** GET /property/:id/image/ */

describe("GET /property/:id/image/:imageId", function () {
  test("gets all images from a property by id", async function () {
    const res = await request(app)
      .get(`/property/${testPropertyIds[0]}/image`)
      .set("authorization", `Bearer ${testUsers[0].token}`);
    expect(res.body).toEqual({
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
    });
  });

  test("works for properties with no images", async function () {
    const res = await request(app)
      .get(`/property/${testPropertyIds[1]}/image`)
      .set("authorization", `Bearer ${testUsers[0].token}`);
    expect(res.body).toEqual({
      images: [],
    });
  });
});
