import { db } from "../db";
import { NotFoundError, BadRequestError } from "../expressError";
import { ImageData, PropertyData } from "../types";

/** Related functions for Images */
class Image {
  /** Create image entry in DB
   * Takes in a { imageKey, propertyId, isCoverImage}
   * Returns {id, imageKey, propertyId, isCoverImage }
   */
  static async create({
    imageKey,
    propertyId,
    isCoverImage = false,
  }: Omit<ImageData, "id">): Promise<ImageData> {
    const result = await db.query(
      `INSERT INTO images (image_key , property_id, is_cover_image)
        VALUES ($1, $2, $3)
          RETURNING id,
                    image_key AS "imageKey",
                    property_id AS "propertyId",
                    is_cover_image AS "isCoverImage"
      `,
      [imageKey, propertyId, isCoverImage]
    );

    const image = result.rows[0] as ImageData;
    return image;
  }

  /** Get all images by property id
   * throws NotFoundError if no property
   * Returns [{id,imageKey, isCoverImage}, ...] || []
   */
  static async getAllByProperty(
    propertyId: number
  ): Promise<Omit<ImageData, "propertyId">[]> {
    const property = await db.query(
      `SELECT id
          FROM properties
            WHERE id = $1
          `,
      [propertyId]
    );

    if (!property.rows[0])
      throw new NotFoundError(`No property: ${propertyId}`);

    const images = await db.query(
      `SELECT id, image_key AS "imageKey", is_cover_image AS "isCoverImage"
          FROM images
              WHERE property_id = $1
      `,
      [propertyId]
    );

    return images.rows as Omit<ImageData, "propertyId">[];
  }

  /** Delete image from  DB by image id
   * throws NotFoundError if no id exists
   *
   * returns undefined on success
   */
  static async delete(id: number) {
    const result = await db.query(
      `DELETE FROM images
         WHERE id = $1
            RETURNING id
      `,
      [id]
    );
    const imageId: number = result.rows[0];

    if (!imageId) throw new NotFoundError(`No image: ${id}`);

    return;
  }
}

export { Image };
