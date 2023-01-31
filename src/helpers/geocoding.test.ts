import { BadRequestError } from "../expressError";
import { getGeocode, google } from "./geocoding";
import {
  AddressType,
  GeocodeResponse,
  GeocodeResult,
} from "@googlemaps/google-maps-services-js";

// Mock API call for geocode method to google client for testing purposes
const mockGeocodeService = jest.spyOn(google, "geocode");

// Mock API response for geocode method to google client for testing purposes
const mockGoogleResponse = [
  {
    types: ["geocode"] as AddressType[],
    formatted_address: "",
    address_components: {
      short_name: "",
      long_name: "",
      postcode_localities: "",
      types: "",
    },
    partial_match: true,
    place_id: "",
    postcode_localities: "",
    geometry: {
      location: { lat: 123456789, lng: 123456789 },
      location_type: "GeocoderLocationType",
      viewport: { lat: 123456789, lng: 123456789 },
      bounds: { lat: 123456789, lng: 123456789 },
    },
  },
] as unknown as GeocodeResult[];

afterEach(() => jest.clearAllMocks);

describe("get geocode", function () {
  test("get successful Google geocode from address input", async function () {
    mockGeocodeService.mockResolvedValue({
      data: { results: mockGoogleResponse },
    } as GeocodeResponse);
    const coordinates = await getGeocode({
      street: "CWC8+R9",
      city: "Mountain View",
      state: "CA",
    });
    expect(coordinates).toEqual({ lat: 123456789, lng: 123456789 });
  });

  test("throw error if invalid address", async function () {
    mockGeocodeService.mockRejectedValue({
      error: "Fail",
    });
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
