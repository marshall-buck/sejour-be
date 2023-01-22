/** AWS s3 bucket functions */
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

/** Uploads a file to AWS s3 bucket
 * Params - { key: string, body: Buffer, propertyId: number }
 * Returns - PutObjectCommand
 */
function uploadImage(key: string, body: Buffer, propertyId: number) {
  const uploadParams = {
    Bucket: AWS_BUCKET,
    Key: `${AWS_BUCKET_PUBLIC_FOLDER}/${propertyId}/${key}`,
    Body: body,
  };
  return s3.send(new PutObjectCommand(uploadParams));
}

export { uploadImage };
