import { NotFoundError } from "../expressError";
import { Message } from "./messageModel";
import {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  messageIds,
} from "./_testCommon";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  test("can create a new message", async function () {
    const newMessage = {
      fromUsername: "u1",
      toUsername: "u2",
      body: "hello world",
    };
    const message = await Message.create(newMessage);

    expect(message).toEqual({
      ...newMessage,
      id: expect.any(Number),
      sentAt: expect.any(Date),
    });
  });
});

/************************************** mark read */

describe("markRead", function () {
  test("can mark a message as read by id", async function () {
    const result = await Message.markRead(messageIds[0]);

    expect(result).toEqual({
      id: expect.any(Number),
      readAt: expect.any(Date),
    });
  });

  test(`throws NotFoundError if no message found for id,
    cannot mark as read`, async function () {
    try {
      const result = await Message.markRead(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** get by id */

describe("get", function () {
  test("can get a message details by id", async function () {
    const result = await Message.get(messageIds[0]);

    expect(result).toEqual({
      id: expect.any(Number),
      fromUser: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        avatar: "test http",
      },
      toUser: {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        avatar: "test http",
      },
      body: "test message",
      sentAt: expect.any(Date),
      readAt: null,
    });
  });

  test(`throws NotFoundError if no message found for id`, async function () {
    try {
      await Message.markRead(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
