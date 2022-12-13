"use strict";

const db = require("../db");

const {
  NotFoundError,
  BadRequestError,
} = require("../expressError");

/** Related functions for Images */
class Image {
  /** create image entry
   * takes in a { key, propertyId}
   * - returns {key, propertyId }
   */
  static async create({ key, propertyId }) {
    const result = await db.query(`
    INSERT INTO images (key, property_id)
        VALUES ($1, $2)
        RETURNING key, property_id AS "propertyId"`,
      [key, propertyId]);

    let image = result.rows[0];
    return image;
  }
}

module.exports = Image;