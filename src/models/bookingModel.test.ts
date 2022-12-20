import { BadRequestError } from "../expressError";
import { Booking } from "./bookingModel";
import { Property } from "./propertyModel";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  propertyIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  test("can create a new booking", async function () {
    const newBooking = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestUsername: "u2",
    };
    const booking = await Booking.create(newBooking);
    const property = await Property.get(propertyIds[0]);

    expect(booking).toEqual({
      id: expect.any(Number),
      guestUsername: "u2",
      startDate: new Date("2022-12-30T05:00:00.000Z"),
      endDate: new Date("2022-12-31T05:00:00.000Z"),
      property: property,
    });
  });

  test("throws an error if start date is after end date", async function () {
    const newBooking = {
      startDate: "2022-12-31T05:00:00.000Z",
      endDate: "2022-12-30T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestUsername: "u2",
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
      guestUsername: "u2",
    };
    const booking2 = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestUsername: "u2",
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
      guestUsername: "u2",
    };
    const booking2 = {
      startDate: "2022-12-29T05:00:00.000Z",
      endDate: "2022-12-31T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestUsername: "u2",
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
      guestUsername: "u2",
    };
    const booking2 = {
      startDate: "2022-12-30T05:00:00.000Z",
      endDate: "2023-01-01T05:00:00.000Z",
      propertyId: propertyIds[0],
      guestUsername: "u2",
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