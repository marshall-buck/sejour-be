import { db } from "../db";
import { NotFoundError, BadRequestError } from "../expressError";

/** Related functions for Images */
class Image {
  /** Create image entry in DB
   * Takes in a { key, propertyId}
   * Returns { key, propertyId }
   */

  // static async create({ key, propertyId }) {
  //   const result = await db.query(
  //     `INSERT INTO images (key, property_id)
  //       VALUES ($1, $2)
  //         RETURNING key, property_id AS "propertyId"
  //     `,
  //     [key, propertyId]
  //   );

  //   const image = result.rows[0];
  //   return image;
  // }

  static async getAllByProperty(propertyId: number) {
    const result = await db.query(
      `SELECT id, image_key AS "imageKey"
          FROM images
              WHERE property_id = $1
      `,
      [propertyId]
    );

    return result.rows;
  }

  // /** Delete image entry in DB by image key */
  // static async delete({ key }) {}
}

export { Image };
