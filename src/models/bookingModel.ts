import { db } from "../db";
import { BadRequestError, NotFoundError } from "../expressError";
import { BookingData, BookingResultData } from "../types";
import { Property } from "./propertyModel";

/** Related function for bookings */
class Booking {
  /** Create a new booking with {startDate, endDate, propertyId, guestId}
   *
   * Returns { booking: { id, startDate, endDate, guestId, property: {}} }
   *  with property is { id, title, street, city, state, zipcode, description,
   *                     price, owner_id, images}
   */
  static async create({
    startDate,
    endDate,
    propertyId,
    guestId,
  }: Omit<BookingData, "id">): Promise<BookingResultData> {
    // check that guestId is not equal to ownerId
    const guestIsOwner = await this._isGuestOwner({ guestId, propertyId });
    if (guestIsOwner) {
      throw new BadRequestError(`Sorry, there was an error creating booking`);
    }

    // check startDate and endDate logic
    if (!this._validateDates({ startDate, endDate })) {
      throw new BadRequestError(`Sorry, there was an error creating booking`);
    }

    // checks if the property is available, throws error if overlapping dates
    const bookingConflict = await this._isBookingAvailable({
      startDate,
      endDate,
      propertyId,
    });
    if (bookingConflict.length) {
      throw new BadRequestError(`Sorry, this property is already
                                booked from ${bookingConflict[0].startDate}
                                to ${bookingConflict[0].endDate}`);
    }

    // if property is available, add booking reservation
    const result = await db.query(
      `
      INSERT INTO bookings (start_date, end_date, property_id, guest_id)
          VALUES ($1, $2, $3, $4)
          RETURNING id,
                    start_date AS "startDate",
                    end_date AS "endDate",
                    guest_id AS "guestId"`,
      [startDate, endDate, propertyId, guestId]
    );

    const booking: BookingResultData = result.rows[0];
    booking.property = await Property.get({ id: propertyId });

    return booking;
  }

  /** Delete a booking with {id}
   * Throws NotFoundError if no id
   * Returns undefined
   *
   */
  static async delete({ id }: Pick<BookingData, "id">) {
    const result = await db.query(
      `DELETE FROM bookings
         WHERE id = $1
            RETURNING id
      `,
      [id]
    );
    const bookingId: Pick<BookingData, "id"> = result.rows[0];
    NotFoundError.handler(bookingId, `No booking: ${id}`);

    return;
  }

  /** Validates booking end date is after start date
   * Returns true if valid, false otherwise
   */
  private static _validateDates({
    startDate,
    endDate,
  }: Pick<BookingData, "startDate" | "endDate">): boolean {
    return endDate > startDate;
  }

  /** Checking if a property is already booked between startDate and endDate
   *
   * Returns an empty array if the property is NOT booked
   * Returns an array of { id, startDate, endDate } if the property is booked
   */
  private static async _isBookingAvailable({
    propertyId,
    startDate,
    endDate,
  }: Omit<BookingData, "id" | "guestId">) {
    const result = await db.query(
      `
        SELECT id, start_date AS "startDate", end_date AS "endDate"
            FROM bookings
                WHERE property_id = $1
                    AND ((start_date between $2 and $3)
                    OR (end_date between $2 and $3)
                    OR ($2 between start_date and end_date)
                    OR ($3 between start_date and end_date));
      `,
      [propertyId, startDate, endDate]
    );
    return result.rows;
  }

  /** Validating that guest is not the owner
   * Finds ownerId by propertyId and compares it against guestId
   *
   * Returns true if the guest is the owner
   */
  private static async _isGuestOwner({
    guestId,
    propertyId,
  }: Pick<BookingData, "propertyId" | "guestId">) {
    const result = await db.query(
      `
       SELECT owner_id AS "ownerId"
          FROM properties
              WHERE id = $1`,
      [propertyId]
    );
    const ownerId = result.rows[0].ownerId;
    return ownerId === guestId;
  }
}

export { Booking };
