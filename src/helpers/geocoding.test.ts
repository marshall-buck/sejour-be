import { transformAddress } from "./geocoding";

describe("transform address", function () {
  test("transforms address correctly", function () {
    const address = transformAddress({
      street: "1600 Amphitheatre Parkway",
      city: "Mountain View",
      state: "CA",
    });
    expect(address).toEqual("1600+Amphitheatre+Parkway,+Mountain+View,+CA");
  });
});
