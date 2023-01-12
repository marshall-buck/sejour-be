import jsonschema from "jsonschema";
import express from "express";
import { ensureLoggedIn } from "../middleware/authMiddleware";
import { BadRequestError, UnauthorizedError } from "../expressError";
import { Property } from "../models/propertyModel";
import { Booking } from "../models/bookingModel";
import { Image } from "../models/imageModel";
import propertyNewSchema from "../schemas/propertyNew.json";
import propertySearchSchema from "../schemas/propertySearch.json";
import propertyUpdateSchema from "../schemas/propertyUpdate.json";
import { PropertySearchFilters, PropertyUpdateData } from "../types";

/** Routes for companies. */
const router = express.Router();

/** POST Create Property
 *
 * Input property: { title, street, city, state, zipcode, description, price }
 *
 * Returns newly created Property:
 * { property: { id, title, street, city, state, zipcode, latitude, longitude,
 * description, price }}
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
 * Accepts a list of optional filter parameters
 *
 * Can filter on provided search filters:
 * - minPrice
 * - maxPrice
 * - description (will find case-insensitive, partial matches)
 *
 * Pagination:
 * - limit
 * - pageNumber
 *
 * Returns all properties fitting filter & pagination specifications
 *   { properties: [ {id, title, street, city, state, zipcode, latitude,
 *                    longitude, description, price, ownerId, images[] }, ...] }
 * where images is [{id, imageKey, isCoverImage}, ...]
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const query: PropertySearchFilters = { ...req.query };
  const q = req.query;

  query.description = q.description as string;
  if (q.minPrice) query.minPrice = Number(q.minPrice as string);
  if (q.maxPrice) query.maxPrice = Number(q.maxPrice as string);
  if (q.limit) query.limit = Number(q.limit as string);
  if (q.pageNumber) query.pageNumber = Number(q.pageNumber as string);

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
 *  property: {id, title, street, city, state, zipcode, latitude,
 *                    longitude, description, price, ownerId, images[] }
 * where images is [{id, imageKey, isCoverImage}, ...]
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

/** POST /:id
 * Creates a new booking with the specified startDate and endDate from request
 *
 * Returns { booking: { id, startDate, endDate, guestId, property: {}} }
 *  with property is { id, title, street, city, state, zipcode, description,
 *                     price, owner_id, images[]}
 * where images is [{id, imageKey, isCoverImage}, ...]
 *
 * Authorization required: same-user-as-:id
 * */

router.post("/:id", ensureLoggedIn, async function (req, res, next) {
  const propertyId = +req.params.id;
  const guestId = res.locals.user.id;
  const { startDate, endDate } = req.body;

  const booking = await Booking.create({
    startDate,
    endDate,
    propertyId,
    guestId,
  });
  return res.status(201).json({ booking });
});

/** PATCH /:id
 * Updates the properties title, description and/or price
 *
 * Returns updated Property:
 * { id, title, street,  city, state, zipcode, latitude, longitude,
 * description, price, id }
 * Throws NotFoundError if no property found for id
 */

router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  const id = +req.params.id;
  const ownerId = await Property.getOwnerId({ id });
  if (ownerId !== res.locals.user.id) {
    throw new UnauthorizedError();
  }
  const reqBody: Omit<PropertyUpdateData, "id"> = { ...req.body };
  const q = req.body;

  reqBody.description = q.description as string;
  reqBody.title = q.title as string;
  if (q.price) reqBody.price = Number(q.price as string);

  const validator = jsonschema.validate(reqBody, propertyUpdateSchema, {
    required: true,
  });
  if (!validator.valid) {
    throw new BadRequestError();
  }
  const property = await Property.update({
    id,
    ...reqBody,
  });
  return res.json({ property });
});

/** DELETE /:id
 * Set archived status to true
 * Throws NotFoundError if no property found for id
 */
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  const id = +req.params.id;
  const ownerId = await Property.getOwnerId({ id });
  if (ownerId !== res.locals.user.id) {
    throw new UnauthorizedError();
  }
  await Property.delete({ id });

  return res.json({ message: `Successfully archived Property ${id}` });
});

export { router as propertyRoutes };
