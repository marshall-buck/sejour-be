import { BadRequestError } from "../expressError";
import { getGeocode } from "./geocoding";
import { Client } from "@googlemaps/google-maps-services-js"

jest.mock("@googlemaps/google-maps-services-js")
const google = jest.mocked(Client)

describe("get geocode", function () {
  test("get Google Maps geocode from adress input", async function () {
   
    const geocode = await getGeocode({
      street: "CWC8+R9",
      city: "Mountain View",
      state: "CA",
    });
    expect(geocode).toEqual({ lat: 37.4220625, lng: -122.0840625 });
  });

  test("throw error if invalid address", async function () {
    try {
      await getGeocode({
        street: "123 lunar lane",
        city: "moon",
        state: "solar system",
      });
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      const errStatus = (err as BadRequestError).status;
      expect(errStatus).toEqual(400);
    }
  });
});
