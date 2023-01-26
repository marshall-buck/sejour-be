/** AWS S3 bucket functions */
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

const s3 = new S3Client({
  region: AWS_REGION,
});

/** Uploads a file to AWS S3 bucket
 * Params - { key: string, body: Buffer, propertyId: number }
 * Returns a PutObjectCommand Promise
 */
function uploadImage(key: string, body: Buffer, propertyId: number) {
  const uploadParams = {
    Bucket: AWS_BUCKET,
    Key: `${AWS_BUCKET_PUBLIC_FOLDER}/${propertyId}/${key}`,
    Body: body,
  };
  return s3.send(new PutObjectCommand(uploadParams));
}

/** Deletes a file from AWS S3 bucket
 * Params - { key: string, propertyId: number }
 * Returns a DeleteObjectCommand Promise
 */
function deleteImage(key: string, propertyId: number) {
  const deleteParams = {
    Bucket: AWS_BUCKET,
    Key: `${AWS_BUCKET_PUBLIC_FOLDER}/${propertyId}/${key}`,
  };
  return s3.send(new DeleteObjectCommand(deleteParams));
}

export { uploadImage, deleteImage };
