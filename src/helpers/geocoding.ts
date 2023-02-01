/** Geocoding and Google Maps services related functions */
import { PropertyData } from "../types";
import { Client } from "@googlemaps/google-maps-services-js";
import { GOOGLE_MAPS_API_KEY } from "../config";
import { BadRequestError } from "../expressError";

const google = new Client({});

/** Make a call to Google Maps Geocode API
 *
 * Given an address params { street, city, state }
 * Returns latitude and longitude: { "lat": 37.4220625, "lng": -122.0840625 }
 *
 * Throws BadRequestError if address is not valid/found by Google Maps
 */
async function getGeocode({
  street,
  city,
  state,
}: Pick<PropertyData, "street" | "city" | "state">) {
  const address = `${street} ${city} ${state}`;
  const args = {
    params: {
      key: GOOGLE_MAPS_API_KEY,
      address: address,
    },
  };

  try {
    const result = await google.geocode(args);
    const coordinates = result.data.results[0].geometry.location;

    return coordinates;
  } catch (error) {
    throw new BadRequestError();
  }
}


export { getGeocode, google };
