import jwt from "jsonwebtoken";
import { createToken } from "./tokens";

describe("createToken", function () {
  jest
    .spyOn(jwt, "sign")
    .mockImplementation(jest.fn(() => "random token string"));

  test("createToken works as expected", function () {
    const token = createToken({
      id: 1,
      isAdmin: false,
    });
    expect(token).toEqual("random token string");
  });
});
