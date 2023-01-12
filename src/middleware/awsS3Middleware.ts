import { NextFunction, Request, Response } from "express";
import { uploadImage } from "../helpers/awsS3";
import { BadRequestError } from "../expressError";

const FILE_SIZE_LIMIT = 1000000;

/** Handles files from multer.upload
 * checks mime type and files size
 * uploads each file to s3 bucket
 * adds array of keys to req.locals.imageKeys
 */
async function handleMulterFiles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const files = req.files as Express.Multer.File[];
  res.locals.imageKeys = [];
  for (const file of files) {
    checkMimeType(file);
    checkFileSize(file);
    const key = Date.now().toString();

    await uploadImage(key, file.buffer);
    res.locals.imageKeys.push(key);
  }
  return next();
}

/** Checks if file is  correct mime type, [jpeg, jpg, png]
 *
 * Returns undefined if correct
 * throws BadRequestError on incorrect mime type
 */
function checkMimeType(file: Express.Multer.File) {
  const mimetype = file.mimetype as string;
  if (
    mimetype !== "image/jpeg" &&
    mimetype !== "image/jpg" &&
    mimetype !== "image/png"
  ) {
    throw new BadRequestError();
  }
}
/** Checks if file is less than 1 megabyte
 *
 * Returns undefined if under limit
 * throws BadRequestError if over limit
 */
function checkFileSize(file: Express.Multer.File) {
  if (file.size > FILE_SIZE_LIMIT) {
    throw new BadRequestError();
  }
}

export { handleMulterFiles };
