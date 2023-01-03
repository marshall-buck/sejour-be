import jwt from "jsonwebtoken";
import { createToken } from "./tokens";

describe("createToken", function () {
  jest
    .spyOn(jwt, "sign")
    .mockImplementation(jest.fn(() => "random token string"));

  test("createToken works as expected", function () {
    const token = createToken({
      username: "test",
      isAdmin: false,
    });
    expect(token).toEqual("random token string");
  });
});
