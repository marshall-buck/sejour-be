import { PropertyData, PropertySearchFilters } from "../types";
import { db } from "../db";
import { NotFoundError, BadRequestError } from "../expressError";

/** Related functions for Properties */

class Property {
  /** Create new Property given property data params
   * { title, street, city, state, zipcode, description, price, ownerUsername, }
   *
   * Returns newly created Property:
   * { id, title, street,  city, state, zipcode, latitude, longitude,
   * description, price, username }
   */

  static async create({
    title,
    street,
    city,
    state,
    zipcode,
    description,
    price,
    ownerUsername,
  }: Omit<PropertyData, "id" | "latitude" | "longitude">) {
    // TODO: figure out lat and long
    const latitude = "-100.234234234";
    const longitude = "50.234234234";
    const result = await db.query(
      `INSERT INTO properties
             ( title,
              street,
              city,
              state,
              zipcode,
              latitude,
              longitude,
              description,
              price,
              owner_username)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id, title,
             street,
             city,
             state,
             zipcode,
             latitude,
             longitude,
             price,
             description,owner_username AS "ownerUsername"`,
      [
        title,
        street,
        city,
        state,
        zipcode,
        latitude,
        longitude,
        description,
        price,
        ownerUsername,
      ]
    );
    const property = result.rows[0];

    return property;
  }

  /** Creates a WHERE clause for filtering
   *
   * searchFilters (all optional):
   * - description
   * - minPrice
   * - maxPrice
   *
   * Returns {
   *  where: "WHERE price >= $1 AND description ILIKE $2",
   *  vals: [100, '%Apple%']
   * }
   */

  static _filterWhereBuilder({
    minPrice,
    maxPrice,
    description,
  }: PropertySearchFilters) {
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
      whereParts.push(
        `description ILIKE $${vals.length} OR title ILIKE $${vals.length}`
      );
    }

    const where =
      whereParts.length > 0 ? "WHERE " + whereParts.join(" AND ") : "";

    return { where, vals };
  }

  /** Find all properties (with optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - description
   * - minPrice
   * - maxPrice
   *
   * Returns array:
   *  [{id, title, street, city, state, zipcode, description, price,
   *  ownerUsername, key}, ...] where key is the s3 image key
   */

  // TODO: We're only returning one image here, so if there are multiple images
  // the Property shows up as many times as there are images
  static async findAll(searchFilters: PropertySearchFilters = {}) {
    const { minPrice, maxPrice, description } = searchFilters;
    if (minPrice && maxPrice) {
      if (minPrice > maxPrice) {
        throw new BadRequestError("Min employees cannot be greater than max");
      }
    }

    const { where, vals } = this._filterWhereBuilder({
      minPrice,
      maxPrice,
      description,
    });

    const propertiesRes = await db.query(
      `
        SELECT p.id,
               p.title,
               p.street,
               p.city,
               p.state,
               p.zipcode,
               p.latitude,
               p.longitude,
               p.description,
               p.price,
               p.owner_username AS "ownerUsername",
               i.key
          FROM properties AS p
          FULL JOIN images AS i ON i.property_id = p.id
          ${where}
          ORDER BY p.id, p.title
      `,
      vals
    );

    return propertiesRes.rows;
  }

  /** Given a property id:
   *
   * Returns property data if found:
   *  {id, title, street, city, state, zipcode, description, price,
   *  owner_username, images } where images is [{key, property_id}, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id: Pick<PropertyData, "id">) {
    const propertyRes = await db.query(
      `SELECT id,
              title,
              address,
              description,
              price,
              owner_username AS "ownerUsername"
            FROM properties
            WHERE id = $1`,
      [id]
    );

    const property = propertyRes.rows[0];

    if (!property) throw new NotFoundError(`No property: ${id}`);

    const imagesRes = await db.query(
      `SELECT id, key, property_id
          FROM images
          WHERE property_id = $1
          ORDER BY key`,
      [id]
    );

    property.images = imagesRes.rows;

    return property;
  }
}

export { Property };
