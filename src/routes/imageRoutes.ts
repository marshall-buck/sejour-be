import express, { Router } from "express";
import { ensureLoggedIn } from "../middleware/authMiddleware";
import { upload, uploadImage } from "../helpers/awsS3";
import { handleMulterFiles } from "../middleware/awsS3Middleware";
import { Image } from "../models/imageModel";
import { randomUUID } from "node:crypto";
const router: Router = express.Router({ mergeParams: true });

/** POST /property/:id/image
 * Create Image
 * Takes in a { imageKey, propertyId, isCoverImage }
 *  Returns [{ id, imageKey, propertyId, isCoverImage },
 *            { error: `Error uploading ${filename}` }... ]
 */
router.post(
  "/",
  ensureLoggedIn,
  upload.array("files", 12),
  handleMulterFiles,
  async function (req, res, next) {
    const files = req.files as Express.Multer.File[];
    const keys = files.map((_file) => randomUUID());

    const promises = files.map((file, index) =>
      uploadImage(keys[index], file.buffer, +req.params.id)
    );

    const results = await Promise.allSettled(promises);

    const images = results.map(async (result, index) => {
      if (result.status === "rejected") {
        const filename = files[index].filename;
        return { error: `Error uploading ${filename}` };
      }

      const image = await Image.create({
        imageKey: keys[index],
        propertyId: +req.params.id,
      });
      return image;
    });

    return res.status(201).json({ images });
  }
);
export { router as imageRoutes };
