import {
  PropertyResponse,
  PropertyData,
  PropertySearchFilters,
  PropertyUpdateData,
} from "../types";
import { db } from "../db";
import { NotFoundError, BadRequestError } from "../expressError";
import { Image } from "./imageModel";

// Default pagination parameters
const PAGINATION = {
  limit: 12,
  pageNumber: 1,
};

/** Related functions for Properties */
class Property {
  /** Create new Property given property data params
   * { title, street, city, state, zipcode, description, price, ownerId, }
   *
   * Returns newly created Property:
   * { id, title, street, city, state, zipcode, latitude, longitude,
   * description, price}
   */
  static async create({
    title,
    street,
    city,
    state,
    zipcode,
    description,
    price,
    ownerId,
  }: Omit<
    PropertyData,
    "id" | "latitude" | "longitude"
  >): Promise<PropertyData> {
    // TODO: figure out lat and long
    const latitude = "-100.234234234";
    const longitude = "50.234234234";
    const result = await db.query(
      `INSERT INTO properties
             (title,
              street,
              city,
              state,
              zipcode,
              latitude,
              longitude,
              description,
              price,
              owner_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING id,
                    title,
                    street,
                    city,
                    state,
                    zipcode,
                    latitude,
                    longitude,
                    price,
                    description,
                    owner_id AS "ownerId"`,
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
        ownerId,
      ]
    );

    const property: PropertyData = result.rows[0];

    return property;
  }

  /** Creates a filter clause for filtering
   *
   * searchFilters (all optional):
   * - description
   * - minPrice
   * - maxPrice
   *
   * Returns {
   *  filter: "AND price >= $3 AND description ILIKE $4",
   *  vals: [100, '%Apple%']
   * }
   */
  private static _filterBuilder({
    minPrice,
    maxPrice,
    description,
  }: Omit<PropertySearchFilters, "limit" | "pageNumber">) {
    let filterParts: string[] = [];
    let vals: (string | number)[] = [];

    if (minPrice !== undefined) {
      vals.push(minPrice);
      filterParts.push(`price >= $${vals.length}`);
    }

    if (maxPrice !== undefined) {
      vals.push(maxPrice);
      filterParts.push(`price <= $${vals.length}`);
    }

    if (description) {
      vals.push(`%${description}%`);
      filterParts.push(
        `description ILIKE $${vals.length} OR title ILIKE $${vals.length}`
      );
    }

    const filter =
      filterParts.length > 0 ? "AND " + filterParts.join(" AND ") : "";

    return { filter, vals };
  }

  /** Find all properties (with optional filters):
   *
   * search filters (all optional):
   * - description
   * - minPrice
   * - maxPrice
   * - limit (default PAGINATION.limit)
   * - pageNumber (default PAGINATION.pageNumber)
   *
   *
   * Returns array:
   *  [{id, title, street, city, state, zipcode, description, price,
   *  ownerId, images}, ...]
   * where images is [{id, imageKey, isCoverImage}, ...]
   */
  static async findAll({
    minPrice,
    maxPrice,
    description,
    limit = PAGINATION.limit,
    pageNumber = PAGINATION.pageNumber,
  }: PropertySearchFilters): Promise<PropertyResponse> {
    // Validate logic for min and max price parameters
    if (minPrice && maxPrice) {
      if (minPrice > maxPrice) {
        throw new BadRequestError("Min price cannot be greater than max");
      }
    }

    const { filter, vals } = this._filterBuilder({
      minPrice,
      maxPrice,
      description,
    });

    const count = await db.query(
      `SELECT COUNT(id) AS "totalResults"
          FROM properties
          WHERE archived = false
          ${filter}
      `,
      [...vals]
    );

    const propertiesRes = await db.query(
      `SELECT p.id,
              p.title,
              p.street,
              p.city,
              p.state,
              p.zipcode,
              p.latitude,
              p.longitude,
              p.description,
              p.price,
              p.owner_id AS "ownerId"
            FROM properties AS p
                WHERE archived = false
                ${filter}
                    ORDER BY p.id, p.title
                    LIMIT $${vals.length + 1}
                    OFFSET (($${vals.length + 2} - 1) * $${vals.length + 1});
      `,
      [...vals, limit, pageNumber]
    );

    for (let i = 0; i < propertiesRes.rows.length; i++) {
      const imagesRes = await Image.getAllByProperty(propertiesRes.rows[i].id);
      propertiesRes.rows[i].images = imagesRes;
    }
    const properties: PropertyData[] = propertiesRes.rows;
    const totalResults: number = +count.rows[0].totalResults;
    const totalPages = Math.ceil(totalResults / limit);

    const pagination = {
      currentPage: pageNumber,
      totalResults: totalResults,
      totalPages: totalPages,
      limit: limit,
    };

    const propertiesResponse: PropertyResponse = {
      properties: properties,
      pagination: pagination,
    };

    return propertiesResponse;
  }

  /** Given a property id:
   *
   * Returns property data if found:
   *  {id, title, street, city, state, zipcode, description, price,
   *  owner_id, images }
   * where images is [{id, imagKey, isCoverImage}, ...]
   *
   * Throws new NotFoundError if not found.
   */
  static async get({ id }: Pick<PropertyData, "id">): Promise<PropertyData> {
    const result = await db.query(
      `SELECT id,
              title,
              street,
              city,
              state,
              zipcode,
              latitude,
              longitude,
              description,
              price,
              owner_id AS "ownerId"
          FROM properties
              WHERE id = $1`,
      [id]
    );

    const property: PropertyData = result.rows[0];
    NotFoundError.handler(property, `No property: ${id}`);

    const imagesResult = await Image.getAllByProperty(id);
    property.images = imagesResult;

    return property;
  }

  /** Given a property id parameter,
   * Updates the properties title, description and/or price
   *
   * Returns updated Property:
   * { id, title, street,  city, state, zipcode, latitude, longitude,
   * description, price, id }
   * Throws NotFoundError if no property found for id
   */
  static async update({
    id,
    title,
    description,
    price,
  }: PropertyUpdateData): Promise<PropertyData> {
    const result = await db.query(
      `UPDATE properties
          SET title = $1, description = $2, price = $3
              WHERE id = $4
                  RETURNING id,
                            title,
                            street,
                            city,
                            state,
                            zipcode,
                            latitude,
                            longitude,
                            price,
                            description,
                            owner_id AS "ownerId"`,
      [title, description, price, id]
    );

    const property: PropertyData = result.rows[0];
    NotFoundError.handler(property, `No property: ${id}`);

    return property;
  }

  /** Delete a property by id:
   *
   * Set archived status to true
   * Throws NotFoundError if no property found for id
   */
  static async delete({ id }: Pick<PropertyData, "id">) {
    const result = await db.query(
      `UPDATE properties
          SET archived = true
              WHERE id = $1
                  RETURNING id
      `,
      [id]
    );
    const propertyId: Pick<PropertyData, "id"> = result.rows[0];
    NotFoundError.handler(propertyId, `No property: ${id}`);

    return;
  }
}

export { Property };
