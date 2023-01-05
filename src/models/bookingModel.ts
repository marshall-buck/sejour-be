import { db } from "../db";
import { BadRequestError, NotFoundError } from "../expressError";
import { BookingData, BookingResultData } from "../types";
import { Property } from "./propertyModel";

/** Related function for bookings */
class Booking {
  /** Create a new booking with {startDate, endDate, propertyId, guestId}
   *
   * Returns booking {id, startDate, endDate, property, guestId}
   * with property as {id, title, address, description, price, ownerId}
   */
  static async create({
    startDate,
    endDate,
    propertyId,
    guestId,
  }: Omit<BookingData, "id">): Promise<BookingResultData> {
    if (!this.validateDates({ startDate, endDate })) {
      throw new BadRequestError(`Sorry, there was an error creating booking`);
    }

    // checks if the property is available, throws error if overlapping dates
    const validateBooking = await db.query(
      `
        SELECT id, start_date, end_date
            FROM bookings
                WHERE property_id = $1
                    AND ((start_date  between $2 and $3)
                    OR (end_date  between $2 and $3)
                    OR ($2 between start_date and end_date)
                    OR ($3 between start_date and end_date));
      `,
      [propertyId, startDate, endDate]
    );

    if (validateBooking.rows.length) {
      throw new BadRequestError(`Sorry, this property is already
                                booked from ${validateBooking.rows[0].start_date}
                                to ${validateBooking.rows[0].end_date}`);
    }

    // if property is available, add booking reservation
    const bookingRes = await db.query(
      `
      INSERT INTO bookings (start_date, end_date, property_id, guest_id)
          VALUES ($1, $2, $3, $4)
          RETURNING id,
                    start_date AS "startDate",
                    end_date AS "endDate",
                    guest_id AS "guestId"`,
      [startDate, endDate, propertyId, guestId]
    );

    const booking: BookingResultData = bookingRes.rows[0];
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
  private static validateDates({
    startDate,
    endDate,
  }: Pick<BookingData, "startDate" | "endDate">): boolean {
    return endDate > startDate;
  }
}

export { Booking };
