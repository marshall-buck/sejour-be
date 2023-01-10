/** Routes for companies. */

import jsonschema from "jsonschema";
import express from "express";

import { ensureLoggedIn } from "../middleware/authMiddleware";
import { BadRequestError } from "../expressError";
import { Property } from "../models/propertyModel";
import { Booking } from "../models/bookingModel";
import { Image } from "../models/imageModel";

import propertyNewSchema from "../schemas/propertyNew.json";
import propertySearchSchema from "../schemas/propertySearch.json";
import { PropertySearchFilters } from "../types";

// import { uploadImg, getUrlFromBucket } from "../helpers/s3";

const router = express.Router();

/** POST Create Property / { property } =>  { property }
 *
 * property: { title, street, city, state, zipcode, description, price }
 *
 * Returns newly created Property:
 * { id, title, street, city, state, zipcode, latitude, longitude,
 * description, price }
 *
 * Authorization required: logged in user
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  const newReqBody = { ...req.body, price: +req.body.price };
  const validator = jsonschema.validate(newReqBody, propertyNewSchema, {
    required: true,
  });

  if (!validator.valid) {
    throw new BadRequestError();
  }

  const data = { ...newReqBody, ownerId: res.locals.user.id };

  const property = await Property.create(data);
  return res.status(201).json({ property });
});

/** GET /  =>
 *   { properties: [
 *     {id, title, address, description ,price, ownerId, key }, ...] }
 *
 * Can filter on provided search filters:
 * - minPrice
 * - maxPrice
 * - description (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const query: PropertySearchFilters = {
    description: req.query.description as string,
    minPrice: Number(req.query.minPrice as string),
    maxPrice: Number(req.query.maxPrice as string),
    limit: Number(req.query.limit as string),
    pageNumber: Number(req.query.limit as string),
  };

  const validator = jsonschema.validate(query, propertySearchSchema, {
    required: true,
  });
  if (!validator.valid) {
    throw new BadRequestError();
  }

  const properties = await Property.findAll(query);
  return res.json({ properties });
});

/** GET /[id]  =>  { property }
 *
 *  Property: { id, title, address, description ,price, owner_id, images }
 *  where images is [{key, property_id}, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const property = await Property.get({ id: +req.params.id });
  return res.json({ property });
});

/** POST {fileData, id: property.id}
 * - returns  Property: { id, title, address, description ,price, owner_id, images }
 *  where images is [{key, property_id}, ...]
 */

// router.post(
//   "/images",
//   uploadImg.array("photos", 3),
//   async function (req, res, next) {
//     const id = req.body.id;
//     const key = req.files[0].key;
//     const imgUrl = getUrlFromBucket(key);

//     await Image.create({ key: imgUrl, propertyId: id });
//     const property = await Property.get(id);
//     return res.json({ property });
//   }
// );

/** POST /[id]/bookings/[id]  { state } => { application }
 *
 * Returns {"booked": propertyId}
 *
 * Authorization required: same-user-as-:id
 * */

router.post("/:id/bookings/", ensureLoggedIn, async function (req, res, next) {
  try {
    const propertyId = +req.params.id;
    const guestId = res.locals.user.id;
    const { startDate, endDate } = req.body;

    const booking = await Booking.create({
      startDate,
      endDate,
      propertyId,
      guestId,
    });
    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
});

export { router as propertyRoutes };
