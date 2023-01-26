import express, { Request, Router } from "express";
import jsonschema from "jsonschema";
import { randomUUID } from "node:crypto";
import { BadRequestError } from "../expressError";
import { deleteImage, uploadImage } from "../helpers/awsS3";
import { upload } from "../helpers/fileServices";
import {
  ensureLoggedIn,
  ensureUserIsPropertyOwner,
} from "../middleware/authMiddleware";
import { Image } from "../models/imageModel";
import imageDeleteSchema from "../schemas/imageDelete.json";

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
    const keys = files.map((_file) => randomUUID());

    const errors: { error: string }[] = [];

    const s3Promises = files.map((file, index) =>
      uploadImage(keys[index], file.buffer, propertyId)
    );
    const s3Results = await Promise.allSettled(s3Promises);
    const imgPromises = s3Results.map((result, index) => {
      if (result.status === "rejected") {
        const filename = files[index].filename;
        errors.push({ error: `Error uploading ${filename}` });
      }
      return Image.create({
        imageKey: keys[index],
        propertyId: propertyId,
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
    console.log("type of imageKeys", Array.isArray(imageKeys));
    const validator = jsonschema.validate(imageKeys, imageDeleteSchema, {
      required: true,
    });
    console.log("validator", validator);
    if (!validator.valid) {
      throw new BadRequestError();
    }

    const errors: { error: string }[] = [];

    const s3Promises = imageKeys.map((key: string) => {
      deleteImage(key, propertyId);
    });
    const s3Results = await Promise.allSettled(s3Promises);
    const imgPromises = s3Results.map((result, index) => {
      console.log("result", result);
      if (result.status === "rejected") {
        errors.push({ error: `Error deleting ${imageKeys[index]}` });
      }
      return Image.delete({ imageKey: imageKeys[index] });
    });

    const imgResults = await Promise.allSettled(imgPromises);
    const success: any[] = (imgResults as PromiseFulfilledResult<any>[])
      .filter((res) => res.status === "fulfilled")
      .map((res) => `Successfully deleted ${res.value}`);
    (imgResults as PromiseRejectedResult[])
      .filter((res) => res.status === "rejected")
      .map((res) => errors.push({ error: res.reason }));

    if (errors.length > 0) {
      return res.status(210).json({ success, errors });
    }

    return res.json({ message: "Successfully deleted all selected image(s)" });
  }
);


export { router as imageRoutes };
