import { NextFunction, Request, Response } from "express";

// const mockFile = {
//   fieldname: 'file',
//   originalname: 'TradeHistory.csv',
//   encoding: '7bit',
//   mimetype: 'text/csv',
//   buffer: Buffer.from(__dirname + '/../../TradeHistory.csv', 'utf8'),
//   size: 51828,
// } as Express.Multer.File

jest.mock("multer", () => {
  const multer = () => ({
    any: () => {
      return (req: Request, res: Response, next: NextFunction) => {
        req.body = { userName: "testUser" };
        req.files = [
          {
            fieldname: "files",
            originalname: "sample.name",
            encoding: "7bit",
            mimetype: "image/jpeg",
            path: "sample.url",
            buffer: Buffer.from("whatever"),
            size: 302128,
            // stream: new Stream(),
            destination: "",
          },
        ];
        return next();
      };
    },
  });
  multer.memoryStorage = () => jest.fn();
  return multer;
});
