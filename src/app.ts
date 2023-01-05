import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import { NotFoundError } from "./expressError";
import { authenticateJWT } from "./middleware/authMiddleware";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

/** Routes */
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req: Request, res: Response, next: NextFunction) {
  throw new NotFoundError();
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

export default app;
