import request from "supertest";
import app from "../app";
import fs from "fs";
import { Image } from "../models/imageModel";
import { File } from "../helpers/awsS3";

import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testPropertyIds,
  testUsers,
  testImageIds,
} from "./_testCommon";
import { MAX_SIZE_LIMIT } from "../config";
import { randomUUID } from "crypto";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/*************************************************** POST /property/:id/image */
describe("POST /property/:id/image ", function () {
  test("uploads images correctly", async function () {
    jest.mock("@aws-sdk/client-s3");
    const fakeImage = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    fs.writeFileSync("fakeImage.jpg", fakeImage);
    const res = await request(app)
      .post(`/property/${testPropertyIds[0]}/image`)
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .type("multipart/form-data")
      .attach("files", "fakeImage.jpg")
      .attach("files", "fakeImage.jpg");

    expect(res.status).toEqual(201);
    expect(res.body).toEqual({
      images: [
        {
          id: expect.any(Number),
          imageKey: expect.any(String),
          propertyId: expect.any(Number),
          isCoverImage: false,
        },
        {
          id: expect.any(Number),
          imageKey: expect.any(String),
          propertyId: expect.any(Number),
          isCoverImage: false,
        },
      ],
    });

    fs.unlinkSync("fakeImage.jpg");
  });

  test("handles s3 error correctly", async function () {
    jest.mock("../helpers/awsS3", () => {
      return {
        File: jest.fn().mockImplementation(() => {
          return {
            uploadImage: jest.fn(),
          };
        }),
      };
    });

    // (
    //   File.uploadImage as jest.MockedFunction<typeof File.uploadImage>
    // ).mockReturnValueOnce(Promise.reject("Upload failed"));
    const mockedFile = File as jest.Mocked<typeof File>;
    mockedFile.uploadImage.mockReturnValueOnce(Promise.reject("Upload failed"));

    const fakeImage = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    fs.writeFileSync("fakeImage.jpg", fakeImage);

    const res = await request(app)
      .post(`/property/${testPropertyIds[0]}/image`)
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .type("multipart/form-data")
      .attach("files", "fakeImage.jpg")
      .attach("files", "fakeImage.jpg");

    expect(res.status).toEqual(210);
    // expect(res.body).toEqual({
    //   images: [
    //     {
    //       id: expect.any(Number),
    //       imageKey: expect.any(String),
    //       propertyId: expect.any(Number),
    //       isCoverImage: false,
    //     },
    //     {
    //       id: expect.any(Number),
    //       imageKey: expect.any(String),
    //       propertyId: expect.any(Number),
    //       isCoverImage: false,
    //     },
    //   ],
    // });

    fs.unlinkSync("fakeImage.jpg");
  });

  test("throws error on incorrect file extension", async function () {
    const fakeText = "This is a fake text file for testing";
    fs.writeFileSync("fakeText.txt", fakeText);

    try {
      await request(app)
        .post(`/property/${testPropertyIds[0]}/image`)
        .set("authorization", `Bearer ${testUsers[0].token}`)
        .type("multipart/form-data")
        .attach("files", "fakeText.txt");
    } catch (error: any) {
      expect(error.message)
        .toEqual(`txt is not an accepted image file extension,
      please use: [".png", ".jpg", "jpeg"]`);
    }
    fs.unlinkSync("fakeText.txt");
  });

  test("throws error on file too large", async function () {
    const data = Buffer.alloc(MAX_SIZE_LIMIT + 1, 0x41).toString("base64");
    const fakeImage = `data:image/jpeg;base64,${data}`;
    fs.writeFileSync("fakeImage.jpg", fakeImage);
    try {
      await request(app)
        .post(`/property/${testPropertyIds[0]}/image`)
        .set("authorization", `Bearer ${testUsers[0].token}`)
        .type("multipart/form-data")
        .attach("files", "fakeImage.jpg");
    } catch (error: any) {
      expect(error.message).toEqual("File size limit exceeded 10mb");
    }
    fs.unlinkSync("fakeImage.jpg");
  });

  test("blocks if user is not authenticated", async function () {
    const res = await request(app).post(
      `/property/${testPropertyIds[0]}/image`
    );
    expect(res.statusCode).toEqual(401);
  });

  test("blocks if user is not authorized/property owner", async function () {
    const res = await request(app)
      .post(`/property/${testPropertyIds[0]}/image/`)
      .set("authorization", `Bearer ${testUsers[1].token}`);
    expect(res.statusCode).toEqual(401);
  });
});

/************************************************* DELETE /property/:id/image */
describe("DELETE /property/:id/image ", function () {
  test("deletes image", async function () {
    const imageKey = randomUUID();

    const image = await Image.create({
      imageKey: imageKey,
      propertyId: testPropertyIds[0],
    });

    const res = await request(app)
      .delete(`/property/${testPropertyIds[0]}/image`)
      .set("authorization", `Bearer ${testUsers[0].token}`)
      .send({ imageKeys: [imageKey] });

    expect(res.body).toEqual({
      message: "Successfully deleted all selected image(s)",
    });
    try {
      await Image.delete({ imageKey });
      throw new Error("You should not get here");
    } catch (error: any) {
      expect(error.message).toEqual(`No image: ${imageKey}`);
    }
  });

  test("blocks if user is not authenticated", async function () {
    const res = await request(app).delete(
      `/property/${testPropertyIds[0]}/image`
    );
    expect(res.statusCode).toEqual(401);
  });

  test("blocks if user is not authorized/property owner", async function () {
    const res = await request(app)
      .delete(`/property/${testPropertyIds[0]}/image/`)
      .set("authorization", `Bearer ${testUsers[1].token}`);
    expect(res.statusCode).toEqual(401);
  });
});

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
