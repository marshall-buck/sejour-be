import { PropertyData } from "../types";
import {Client} from "@googlemaps/google-maps-services-js";

// Geocoding and Google Maps services related functions
const client = new Client({});

// const GOOGLE_GEOCODE_API: `https://maps.googleapis.com/maps/api/geocode/json?address=${}&key=${}`

/**
 * Transform address string into a formatted output string
 * Example:
 * 1600 Amphitheatre Parkway, Mountain View, CA =>
 * 1600+Amphitheatre+Parkway,+Mountain+View,+CA
*/
function transformAddress({street, city, state}: Pick<PropertyData, "street" | "city" | "state">): string {
  const address = `${street}, ${city}, ${state}`
  return address.replaceAll(" ", "+")
}

/** Make a call to Google Maps Geocode API
 *
 * Given an address string
 * Returns latitude and longitude
 */
function findGeocode(address: string) {
  client.geocode({})
}


export {
  transformAddress
}