"use strict";

const { S3Client } = require("@aws-sdk/client-s3");

const {
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
} = require("../config");

const s3Client = new S3Client({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const multer = require("multer");
const multerS3 = require("multer-s3");

/** multer upload function */
const uploadImg = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.filename });
    },
    key: function (req, file, cb) {
      cb(null, `public/${Date.now().toString()}`);
    },
  }),
});

/** Construct a object URL from s3 bucket parameters
 * returns a url string
 *
 * @example https://r27-sharebnb.s3.amazonaws.com/1663108593387
 */

function getUrlFromBucket(key) {
  return `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

module.exports = {
  uploadImg,
  getUrlFromBucket,
};
