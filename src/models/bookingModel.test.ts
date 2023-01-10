import { db } from "../db";
import { BadRequestError, NotFoundError } from "../expressError";
import { Booking } from "./bookingModel";
import { Property } from "./propertyModel";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds,
  bookingIds,
  userIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/********************************************************************* create */

describe("create", function () {
  test("can create a new booking", async function () {
    const newBooking = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[1],
    };
    const booking = await Booking.create(newBooking);
    const property = await Property.get({ id: propertyIds[0] });

    expect(booking).toEqual({
      id: expect.any(Number),
      guestId: userIds[1],
      startDate: new Date("2022-12-30T05:00:00.000Z"),
      endDate: new Date("2022-12-31T05:00:00.000Z"),
      property: property,
    });
  });

  test("throws an error if guest is owner", async function () {
    const newBooking = {
      startDate: "2022-12-31T05:00:00.000Z",
      endDate: "2022-12-30T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[0],
    };
    try {
      await Booking.create(newBooking);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("throws an error if start date is after end date", async function () {
    const newBooking = {
      startDate: "2022-12-31T05:00:00.000Z",
      endDate: "2022-12-30T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[1],
    };
    try {
      await Booking.create(newBooking);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("throws error if conflicting bookings on same dates", async function () {
    const booking1 = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[1],
    };
    const booking2 = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[1],
    };

    try {
      await Booking.create(booking1);
      await Booking.create(booking2);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("throws error if overlapping start dates", async function () {
    const booking1 = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[1],
    };
    const booking2 = {
      startDate: "2022-12-29T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[1],
    };

    try {
      await Booking.create(booking1);
      await Booking.create(booking2);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("throws error if overlapping end dates", async function () {
    const booking1 = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[1],
    };
    const booking2 = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2023-01-01T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestId: userIds[1],
    };

    try {
      await Booking.create(booking1);
      await Booking.create(booking2);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/********************************************************************* delete */

describe("delete", function () {
  test("Deletes booking", async function () {
    await Booking.delete({ id: bookingIds[0] });
    const booking = await db.query(`
        SELECT id
          FROM bookings
            WHERE id = ${bookingIds[0]}`);

    expect(booking.rows).toEqual([]);
  });

  test("throws not found if no such booking", async function () {
    try {
      await Booking.delete({ id: 0 });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errStatus = (err as NotFoundError).status;
      expect(errStatus).toEqual(404);
    }
  });
});
