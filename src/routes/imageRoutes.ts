import express, { Request, Router } from "express";
import jsonschema from "jsonschema";
import { randomUUID } from "node:crypto";
import { BadRequestError } from "../expressError";
import { File } from "../helpers/awsS3";
import { upload } from "../helpers/fileServices";
import {
  ensureLoggedIn,
  ensureUserIsPropertyOwner,
} from "../middleware/authMiddleware";
import { Image } from "../models/imageModel";
import imageDeleteSchema from "../schemas/imageDelete.json";
import { DeleteObjectCommandOutput } from "@aws-sdk/client-s3/dist-types/commands/DeleteObjectCommand";

/** Routes for images */
const router: Router = express.Router({ mergeParams: true });

/** POST /property/:id/image
 *
 * Uploads image files to AWS S3 and creates new images in DB
 *
 * Returns { images: [{ id, imageKey, propertyId, isCoverImage },
 *            { error: `Error uploading ${filename}` }... ] }
 *
 * Authorizations: logged in user & user must be property owner
 */
router.post(
  "/",
  ensureLoggedIn,
  ensureUserIsPropertyOwner,
  upload.array("files", 12),
  async function (req, res, next) {
    const propertyId = +req.params.id;

    const files = req.files as Express.Multer.File[];

    // generate an array of unique keys for each file
    const keys = files.map((_file) => randomUUID());

    const errors: { error: string }[] = [];

    // generate Promise[] for each file to upload
    const s3Promises = files.map((file, index) =>
      File.uploadImage(keys[index], file.buffer, propertyId)
    );
    const s3Results = await Promise.allSettled(s3Promises);

    /** For each Rejected Promises
     * Add Error message to to Error[] */
    s3Results
      .filter((res) => res.status === "rejected")
      .forEach((_, i) => {
        const filename = files[i].originalname;
        errors.push({ error: `Error uploading ${filename}` });
      });

    /** For each Fulfilled Promises
     * Generates Promise[] for each uploaded image file to add to database */
    const imgPromises = s3Results
      .filter((res) => res.status === "fulfilled")
      .map((_, i) => {
        return Image.create({
          imageKey: keys[i],
          propertyId: propertyId,
        });
      });

    const imgResults = await Promise.allSettled(imgPromises);

    // for all resolved Promises, handles fulfilled promises
    const images: any[] = (imgResults as PromiseFulfilledResult<any>[])
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);
    // for all resolved Promises, handles rejected promises
    (imgResults as PromiseRejectedResult[])
      .filter((res) => res.status === "rejected")
      .forEach((res) => errors.push({ error: res.reason }));

    if (errors.length > 0) {
      return res.status(210).json({ images, errors });
    }

    return res.status(201).json({ images });
  }
);

/** GET property/:id/image
 *
 * Gets all the images associated to a given property id
 *
 * Returns { images: [{ id, imageKey, isCoverImage }, ...] }
 *
 * Authorizations: none
 */
router.get("/", async function (req: Request, res, next) {
  const propertyId = +req.params.id;
  const images = await Image.getAllByProperty(propertyId);

  return res.json({ images });
});

/** PATCH property/:id/image/:imageId
 *
 * Updates a given image by :imageId to a given property by :id
 * Sets isCoverImage to TRUE for the image
 * and sets isCoverImage to FALSE for all other images of that property
 *
 * Returns updated image:
 *  { image: { id, imageKey, propertyId, isCoverImage } }
 *
 * Authorizations: logged in user & user must be property owner
 */
router.patch(
  "/:imageId",
  ensureLoggedIn,
  ensureUserIsPropertyOwner,
  async function (req: Request, res, next) {
    const propertyId = +req.params.id;
    const imageId = +req.params.imageId;

    const image = await Image.update({ id: imageId, propertyId: propertyId });

    return res.json({ image });
  }
);

/** DELETE property/:id/image/
 *
 * Takes in a imageKeys[] from request body:  [imageKey, ...]
 * Deletes selected images from S3
 * Deletes selected images from Images table
 *
 * Returns successful message
 * Return error message if fails
 *
 * Authorizations: logged in user & user must be property owner
 */
router.delete(
  "/",
  ensureLoggedIn,
  ensureUserIsPropertyOwner,
  async function (req: Request, res, next) {
    const propertyId = +req.params.id;
    const imageKeys = req.body.imageKeys;

    const validator = jsonschema.validate(imageKeys, imageDeleteSchema, {
      required: true,
    });
    if (!validator.valid) {
      throw new BadRequestError();
    }

    const errors: { error: string }[] = [];

    // generate Promise[] for each file to upload
    const s3Promises = imageKeys.map((key: string) => {
      return File.deleteImage(key, propertyId);
    });

    const s3Results = await Promise.allSettled(s3Promises);

    /** For each Rejected Promises
     * Add Error message to to Error[] */

    s3Results
      .filter((res) => res.status === "rejected")
      .forEach((_, i) => {
        errors.push({ error: `AWS error deleting ${imageKeys[i]}` });
      });

    /** For each Fulfilled Promises
     * Generates Promise[] for each deleted image file to delete to database */
    const imgPromises = s3Results
      .filter((res) => res.status === "fulfilled")
      .map((_, i) => {
        return Image.delete({ imageKey: imageKeys[i] });
      });

    const imgResults = await Promise.allSettled(imgPromises);

    // // for all fulfilled Promises, handles rejected/resolved promises
    const success: any[] = (imgResults as PromiseFulfilledResult<any>[])
      .filter((res) => res.status === "fulfilled")
      .map((res) => `Successfully deleted ${res.value}`);

    (imgResults as PromiseRejectedResult[])
      .filter((res) => res.status === "rejected")
      .forEach((res) => errors.push({ error: res.reason }));

    if (errors.length > 0) {
      return res.status(210).json({ success, errors });
    }

    return res.json({ message: "Successfully deleted all selected image(s)" });
  }
);

export { router as imageRoutes };
