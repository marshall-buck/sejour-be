import { db } from "../db";
import { BadRequestError } from "../expressError";
import { BookingData, BookingResultData } from "../types";
import { Property } from "./propertyModel";

/** Related function for bookings */

class Booking {
  /** Create a new booking with {startDate, endDate, propertyId, guestUsername}
   *
   * returns booking {id, startDate, endDate, property, guestUsername}
   * with property as {id, title, address, description, price, ownerUsername}
   */
  // TODO: add Edit Booking -cancel booking and rebook
  static async create({
    startDate,
    endDate,
    propertyId,
    guestUsername,
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
      INSERT INTO bookings (start_date, end_date, property_id, guest_username)
          VALUES ($1, $2, $3, $4)
          RETURNING id,
                    start_date AS "startDate",
                    end_date AS "endDate",
                    guest_username AS "guestUsername"`,
      [startDate, endDate, propertyId, guestUsername]
    );

    const booking: BookingResultData = bookingRes.rows[0];
    booking.property = await Property.get(propertyId);

    return booking;
  }

  /**
   * Validates booking end date is after start date
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
