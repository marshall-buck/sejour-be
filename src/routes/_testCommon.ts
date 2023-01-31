import { db } from "../db";
import { User } from "../models/userModel";
import { Message } from "../models/messageModel";
import { Image } from "../models/imageModel";
import { createToken } from "../helpers/tokens";
import { Property } from "../models/propertyModel";
import { randomUUID } from "node:crypto";
import { getGeocode } from "../helpers/geocoding";
import { LatLngLiteral } from "@googlemaps/google-maps-services-js";

type UserTestData = {
  id: number;
  token: string;
};

const testUsers: UserTestData[] = [];
const testPropertyIds: number[] = [];
const testMessageIds: number[] = [];
const testImageIds: number[] = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM images");
  await db.query("DELETE FROM properties");
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM users");

  await registerTestUsers();
  await createTestMessages();
  await createTestProperties();
  await createTestImages();
}

// const geocodeMockSetup = () => {
//   const mock = jest.mock("../helpers/geocoding", () => {
//     const originalModule = jest.requireActual("../helpers/geocoding");

//     //Mock the default export and named export 'foo'
//     return {
//       __esModule: true,
//       ...originalModule,
//       default: jest.fn(() => 'mocked baz'),
//       foo: 'mocked foo',
//     };
//   });
//   mockedGeocode.mockResolvedValue({
//     lat: 123.123456,
//     lng: -123.123456,
//   } as LatLngLiteral);
// };

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

export {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  // geocodeMockSetup,
  testUsers,
  testPropertyIds,
  testMessageIds,
  testImageIds,
};

/***************** HELPER FUNCTIONS FOR POPULATING DB BEFORE ALL **************/

/** Add users to DB with test users */
async function registerTestUsers() {
  const u1 = await User.register({
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
    avatar: "test_url1",
  });
  const u2 = await User.register({
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
    avatar: "test_url2",
  });
  const u3 = await User.register({
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
    avatar: "test_url3",
  });

  testUsers.push(
    {
      id: u1.id,
      token: createToken({ id: u1.id, isAdmin: false }),
    },
    {
      id: u2.id,
      token: createToken({ id: u2.id, isAdmin: false }),
    },
    {
      id: u3.id,
      token: createToken({ id: u3.id, isAdmin: true }),
    }
  );
}
/** Add messages to DB with test messages */
async function createTestMessages() {
  const m1 = await Message.create({
    fromId: testUsers[1].id,
    toId: testUsers[0].id,
    body: "hello u1",
  });

  const m2 = await Message.create({
    fromId: testUsers[0].id,
    toId: testUsers[1].id,
    body: "hello u2",
  });

  testMessageIds.push(m1.id, m2.id);
}

/** Add properties to DB with test properties */
async function createTestProperties() {
  const p1 = await Property.create({
    title: "Prop 1",
    street: "street 1",
    city: "city 1",
    state: "state 1",
    zipcode: "zipcode 1",
    latitude: "123.123123",
    longitude: "-123.123123",
    ownerId: testUsers[0].id,
    description: "description 1",
    price: 100,
  });
  const p2 = await Property.create({
    title: "Prop 2",
    street: "street 2",
    city: "city 2",
    state: "state 2",
    zipcode: "zipcode 2",
    latitude: "-123.123123",
    longitude: "123.123123",
    ownerId: testUsers[0].id,
    description: "description 2",
    price: 200,
  });

  testPropertyIds.push(p1.id, p2.id);
}

/** Add images to DB with test images */
async function createTestImages() {
  const i1 = await Image.create({
    imageKey: randomUUID(),
    propertyId: testPropertyIds[0],
    isCoverImage: true,
  });
  const i2 = await Image.create({
    imageKey: randomUUID(),
    propertyId: testPropertyIds[0],
    isCoverImage: false,
  });

  testImageIds.push(i1.id, i2.id);
}
