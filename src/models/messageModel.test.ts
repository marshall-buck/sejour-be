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
      const errMessage = (err as Error).message;
      const errStatus = (err as NotFoundError).status;
      expect(errMessage).toEqual("No such message: 0");
      expect(errStatus).toEqual(404);
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
        avatar: "test url",
      },
      toUser: {
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        avatar: "test url",
      },
      body: "test message",
      sentAt: expect.any(Date),
      readAt: null,
    });
  });

  test(`throws NotFoundError if no message found for id`, async function () {
    try {
      await Message.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      const errMessage = (err as Error).message;
      const errStatus = (err as NotFoundError).status;
      expect(errMessage).toEqual("No such message: 0");
      expect(errStatus).toEqual(404);
    }
  });
});
