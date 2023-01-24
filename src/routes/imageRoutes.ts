import { PolicyStatus } from "@aws-sdk/client-s3";
import express, { Router } from "express";
import { randomUUID } from "node:crypto";
import { UnauthorizedError } from "../expressError";
import { uploadImage } from "../helpers/awsS3";
import { upload } from "../helpers/fileServices";
import {
  ensureLoggedIn,
  ensureUserIsPropertyOwner,
} from "../middleware/authMiddleware";
import { Image } from "../models/imageModel";
import { Property } from "../models/propertyModel";
const router: Router = express.Router({ mergeParams: true });

/** POST /property/:id/image
 * Uploads image files to AWS S3 and creates new images in DB
 *
 * Returns [{ id, imageKey, propertyId, isCoverImage },
 *            { error: `Error uploading ${filename}` }... ]
 */
router.post(
  "/",
  ensureLoggedIn,
  ensureUserIsPropertyOwner,
  upload.array("files", 12),
  async function (req, res, next) {
    const id = +req.params.id;

    const files = req.files as Express.Multer.File[];
    const keys = files.map((_file) => randomUUID());

    const s3Promises = files.map((file, index) =>
      uploadImage(keys[index], file.buffer, id)
    );

    const s3Results = await Promise.allSettled(s3Promises);

    const errors: { error: string }[] = [];

    const imgPromises = s3Results.map((result, index) => {
      if (result.status === "rejected") {
        const filename = files[index].filename;
        errors.push({ error: `Error uploading ${filename}` });
      }
      return Image.create({
        imageKey: keys[index],
        propertyId: id,
      });
    });

    const imgResults = await Promise.allSettled(imgPromises);

    const images: any[] = (imgResults as PromiseFulfilledResult<any>[])
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);

    (imgResults as PromiseRejectedResult[])
      .filter((res) => res.status === "rejected")
      .map((res) => errors.push({ error: res.reason }));

    if (errors.length > 0) {
      return res.status(210).json({ images, errors });
    }

    return res.status(201).json({ images });
  }
);
export { router as imageRoutes };
