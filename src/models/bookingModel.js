"use strict";

const { AbortMultipartUploadOutputFilterSensitiveLog } = require("@aws-sdk/client-s3");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");

/** Related function for bookings */

class Booking {

  /** Create a new booking with {startDate, endDate, propertyId, guestUsername}
   *
   * returns booking {id, startDate, endDate, property, guestUsername}
   * with property as {id, title, address, description, price, ownerUsername}
   */
  static async create({ startDate, endDate, propertyId, guestUsername }) {
    const validateBooking = await db.query(`
                          SELECT id, start_date, end_date
                          FROM bookings
                          WHERE property_id = $1
                          AND ((start_date  between $2 and $3)
                          OR (end_date  between $2 and $3)
                          OR ($2 between start_date and end_date)
                          OR ($3 between start_date and end_date));
                      `, [propertyId, startDate, endDate]);


    if (validateBooking.rows.length) {
      throw new BadRequestError(`Sorry, this property is already
                                booked from${validateBooking.rows[0].start_date}
                                to ${validateBooking.rows[0].end_date}`);
    }

    const bookingRes = await db.query(`
      INSERT INTO bookings (start_date, end_date, property_id, guest_username)
          VALUES ($1, $2, $3, $4)
          RETURNING id,
                    start_date AS "startDate",
                    end_date AS "endDate",
                    guest_username AS "guestUsername"`,
      [startDate, endDate, propertyId, guestUsername]);

    const booking = bookingRes.rows[0];

    const propertyRes = await db.query(
      `SELECT id,
              title,
              address,
              description,
              price,
              owner_username AS "ownerUsername"
            FROM properties
            WHERE id = $1`,
      [propertyId]);

    booking.property = propertyRes.rows[0];

    return booking;
  }
}

module.exports = Booking;


// select id, start_date, end_date from bookings where property_id = 2;
// and('2022-09-10' between start_date and end_date) or(
//   '2022-09-20' between start_date and end_date);


//   select id from bookings where property_id = 2 and(start_date  between '2022-09-10' and '2022-09-25') or(end_date  between '2022-09-10' and '2022-09-25')


//   select id from bookings where property_id = 2 and(start_date  between '2022-09-17' and '2022-09-18') or(end_date  between '2022-09-17' and '2022-09-18');



//   select id from bookings where property_id = 2 and(start_date  between '2022-09-17' and '2022-09-18') or(end_date  between '2022-09-17' and '2022-09-18') or('2022-09-17' between start_date and end_date) or(
//     '2022-09-18' between start_date and end_date);