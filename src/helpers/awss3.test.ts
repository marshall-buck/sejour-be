import { AWS_BUCKET, AWS_BUCKET_PUBLIC_FOLDER } from "../config";
import { uploadImage, deleteImage } from "./awsS3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

jest.mock("@aws-sdk/client-s3");

/** Tests uploadImage */
describe("uploadImage", function () {
  test("PutObjectCommand is called", async function () {
    const buffer = Buffer.alloc(10);
    uploadImage("key", buffer, 1);
    const uploadParams = {
      Bucket: AWS_BUCKET,
      Key: `${AWS_BUCKET_PUBLIC_FOLDER}/1/key`,
      Body: buffer,
    };

    expect(PutObjectCommand).toHaveBeenCalledWith(uploadParams);
  });
});

/** Tests deleteImage */
describe("deleteImage", function () {
  test("DeleteObjectCommand is called", async function () {
    deleteImage("key", 1);
    const deleteParams = {
      Bucket: AWS_BUCKET,
      Key: `${AWS_BUCKET_PUBLIC_FOLDER}/1/key`,
    };

    expect(DeleteObjectCommand).toHaveBeenCalledWith(deleteParams);
  });
});

afterEach(() => jest.clearAllMocks);
