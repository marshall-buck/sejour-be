import express, { Router } from "express";
import { propertyRoutes } from "./propertyRoutes";
import { ensureLoggedIn } from "../middleware/authMiddleware";
import { upload } from "../helpers/awsS3";

import { handleMulterFiles } from "../middleware/awsS3Middleware";
const router: Router = express.Router({ mergeParams: true });

/** POST /property/:id/image
 * Create Image
 * Takes in a { imageKey, propertyId, isCoverImage }
 *  Returns { id, imageKey, propertyId, isCoverImage }
 */
router.post(
  "/",
  ensureLoggedIn,
  upload.array("files", 12),
  handleMulterFiles,
  function (req, res, next) {
    return res.json({ message: "success" });
  }
);
export { router as imageRoutes };
