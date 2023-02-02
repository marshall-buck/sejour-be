/** AWS S3 bucket functions */
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AWS_BUCKET, AWS_BUCKET_PUBLIC_FOLDER, AWS_REGION } from "../config";

const s3 = new S3Client({
  region: AWS_REGION,
});

class File {
  /** Uploads a file to AWS S3 bucket
   * Params - { key: string, body: Buffer, propertyId: number }
   * Returns a PutObjectCommand Promise
   */
  static uploadImage(key: string, body: Buffer, propertyId: number) {
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
  static deleteImage(key: string, propertyId: number) {
    const deleteParams = {
      Bucket: AWS_BUCKET,
      Key: `${AWS_BUCKET_PUBLIC_FOLDER}/${propertyId}/${key}`,
    };
    return s3.send(new DeleteObjectCommand(deleteParams));
  }
}


export { File };
