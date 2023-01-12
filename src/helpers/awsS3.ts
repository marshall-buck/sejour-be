import multer from "multer";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommandOutput,
  GetObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
} from "@aws-sdk/client-s3";
import { AWS_REGION, AWS_BUCKET, AWS_BUCKET_PUBLIC_FOLDER } from "../config";
import { NextFunction, Request, Response } from "express";

const s3 = new S3Client({
  region: AWS_REGION,
});
const upload = multer();

export { upload };
// get the req
// for each file in the request,
// validate file, size and extension jpg / png
// make the filename
// upload to s3
// on success we add to db
// check for size
// upload the file,
// and put in db.

/**Uploads 1 image to s3 bucket
 *
 * Params- {key:string, body: Buffer}
 *
 * Returns - PutObjectCommandOutput
 * {
  '$metadata': {
    httpStatusCode: number,
    requestId: string,
    extendedRequestId: string,
    cfId: undefined,
    attempts: number,
    totalRetryDelay: number
  },
  ETag: string
}}
 */

async function uploadImage(key: string, body: Buffer) {
  const uploadParams = {
    Bucket: AWS_BUCKET,
    Key: `${AWS_BUCKET_PUBLIC_FOLDER}/${key}`,
    Body: body,
  };
  try {
    await s3.send(new PutObjectCommand(uploadParams));
  } catch (error: any) {
    console.error(error);
  }
}
export { uploadImage };
