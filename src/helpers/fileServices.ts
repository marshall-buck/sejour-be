/** File services/multer related middleware */
import { Request } from "express";
import multer from "multer";
import Path from "path";
import { MAX_SIZE_LIMIT } from "../config";

/**
 * Upload a file with multer library
 *
 * Params:
 * - limits.fileSize: MAX_SIZE_LIMIT
 * - fileFilter: accepts extensions specified in acceptableExtensions:
 *   [".png", ".jpg", "jpeg"];
 *
 * Returns callback (null, true) to accept the file is pass
 * Else throws new Error
 */
const upload = multer({
  limits: {
    fileSize: MAX_SIZE_LIMIT,
  },
  fileFilter: (req: Request, file, callback) => {
    const acceptableExtensions = [".png", ".jpg", "jpeg"];
    if (!acceptableExtensions.includes(Path.extname(file.originalname))) {
      return callback(
        new Error(
          `${file.mimetype} is not an accepted image file extension,
          please use: ${acceptableExtensions}`
        )
      );
    }

    const fileSize = parseInt(req.headers["content-length"] as string);
    if (fileSize > MAX_SIZE_LIMIT) {
      return callback(new Error("File size limit exceeded 10mb"));
    }

    callback(null, true);
  },
});

export { upload };
