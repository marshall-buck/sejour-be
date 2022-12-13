"use strict";

const db = require("../db");


const {
  NotFoundError,
  BadRequestError,

} = require("../expressError");



/** Related functions for Properties */

class Property {

  /** Create Property
   * given property data { title, address, description , price }
   *
   * return {id, title, address, description ,price, owner_username }
   */

  static async create({ title, address, description, price, ownerUsername }) {
    const result = await db.query(
      `INSERT INTO properties
             (title,
              address,
              description,
              price,
              owner_username)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, title, address, description,
                        price, owner_username AS "ownerUsername"`,
      [
        title, address, description, price, ownerUsername
      ],
    );
    const property = result.rows[0];

    return property;
  }

  /** Create WHERE clause for filters, to be used by functions that query
   * with filters.
   *
   * searchFilters (all optional):
   * - description
   * - minPrice
   * - maxPrice
   *
   *
   * Returns {
   *  where: "WHERE price >= $1 AND description ILIKE $2",
   *  vals: [100, '%Apple%']
   * }
   */

  static _filterWhereBuilder({ minPrice, maxPrice, description }) {
    let whereParts = [];
    let vals = [];

    if (minPrice !== undefined) {
      vals.push(minPrice);
      whereParts.push(`price >= $${vals.length}`);
    }

    if (maxPrice !== undefined) {
      vals.push(maxPrice);
      whereParts.push(`price <= $${vals.length}`);
    }

    if (description) {
      vals.push(`%${description}%`);
      whereParts.push(`description ILIKE $${vals.length} OR title ILIKE $${vals.length}`);
    }


    const where = (whereParts.length > 0) ?
      "WHERE " + whereParts.join(" AND ")
      : "";

    return { where, vals };
  }


  /** Find all properties (optional filter on searchFilters).
 *
 * searchFilters (all optional):
 * - description
 * - minPrice
 * - maxPrice
 *
 * Returns array-
 *     [{ id, title, address, description ,price, ownerUsername, key}, ...]
 * where key is the s3 image url
 * */

  // TODO: We're only returning one image here, so if there are multiple images
  // the Property shows up as many times as there are images
  static async findAll(searchFilters = {}) {
    const { minPrice, maxPrice, description } = searchFilters;

    if (minPrice > maxPrice) {
      throw new BadRequestError("Min employees cannot be greater than max");
    }

    const { where, vals } = this._filterWhereBuilder({
      minPrice, maxPrice, description
    });

    const propertiesRes = await db.query(`
        SELECT p.id,
               p.title,
               p.address,
               p.description,
               p.price,
               p.owner_username AS "ownerUsername",
               i.key
          FROM properties AS p
          FULL JOIN images AS i ON i.property_id = p.id
          ${where}
      `, vals);


    return propertiesRes.rows;
  }

  //   SELECT p.id,
  //   p.title,
  //   p.address,
  //   p.description,
  //   p.price,
  //   p.owner_username AS "ownerUsername",
  //   i.key
  // JOIN images AS i ON i.property_id = p.id
  // FROM properties AS p
  // ${where}
  // ORDER BY p.title
  // `, vals);



  /** Given a property id, return data about property.
 *
 * Returns {id, title, address, description ,price, owner_username, images }
 * where images is [{key, property_id}, ...]
 *
 * Throws NotFoundError if not found.
 **/

  static async get(id) {
    const propertyRes = await db.query(
      `SELECT id,
              title,
              address,
              description,
              price,
              owner_username AS "ownerUsername"
            FROM properties
            WHERE id = $1`,
      [id]);

    const property = propertyRes.rows[0];

    if (!property) throw new NotFoundError(`No property: ${id}`);

    const imagesRes = await db.query(
      `SELECT key, property_id
          FROM images
          WHERE property_id = $1
          ORDER BY key`,
      [id]);

    property.images = imagesRes.rows;

    return property;
  }


}
module.exports = Property;

