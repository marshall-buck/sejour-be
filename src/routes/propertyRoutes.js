"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { ensureLoggedIn } = require("../middleware/authMiddleware");
const { BadRequestError } = require("../expressError");
const Property = require("../models/propertyModel");
const Booking = require("../models/bookingModel");
const Image = require("../models/imageModel");

const propertyNewSchema = require("../schemas/propertyNew.json");
const propertySearchSchema = require("../schemas/propertySearch.json");

const { uploadImg, getUrlFromBucket } = require('../helpers/s3');

const router = new express.Router();


/** POST Create Property / { property } =>  { property }
 *
 * property should be { title, address, description ,price }
 *
 * return {id, title, address, description ,price, owner_username }
 *
 * Authorization required: logged in user
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {

  const newReqBody = { ...req.body, price: +req.body.price };
  const validator = jsonschema.validate(
    newReqBody,
    propertyNewSchema,
    { required: true }
  );


  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const data = { ...newReqBody, ownerUsername: res.locals.user.username };

  const property = await Property.create(data);
  return res.status(201).json({ property });
});

/** GET /  =>
 *   { properties: [
 *     {id, title, address, description ,price, ownerUsername, key }, ...] }
 *
 * Can filter on provided search filters:
 * - minPrice
 * - maxPrice
 * - description (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const q = req.query;
  // arrive as strings from querystring, but we want as ints
  if (q.minPrice !== undefined) q.minPrice = +q.minPrice;
  if (q.maxPrice !== undefined) q.maxPrice = +q.maxPrice;

  const validator = jsonschema.validate(
    q,
    propertySearchSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const properties = await Property.findAll(q);
  return res.json({ properties });
});

/** GET /[id]  =>  { property }
 *
 *  Property: { id, title, address, description ,price, owner_username, images }
 *  where images is [{key, property_id}, ...]
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const property = await Property.get(req.params.id);
  return res.json({ property });
});



/** POST {fileData, id: property.id}
 * - returns  Property: { id, title, address, description ,price, owner_username, images }
 *  where images is [{key, property_id}, ...]
*/

router.post('/images', uploadImg.array('photos', 3),
  async function (req, res, next) {
    const id = req.body.id;
    const key = req.files[0].key;
    const imgUrl = getUrlFromBucket(key);

    await Image.create({ key: imgUrl, propertyId: id });
    const property = await Property.get(id);
    return res.json({ property });
  });

/** POST /[username]/bookings/[id]  { state } => { application }
 *
 * Returns {"booked": propertyId}
 *
 * Authorization required: same-user-as-:username
 * */

router.post("/:id/bookings/", ensureLoggedIn,
  async function (req, res, next) {
    try {
      const propertyId = +req.params.id;
      const guestUsername = res.locals.user.username;
      const { startDate, endDate } = req.body;

      const booking = await Booking.create({
        startDate,
        endDate,
        propertyId,
        guestUsername
      });
      return res.json({ booking });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;
