import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import notesRouter from "./routes/notes.route";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import courseRouter from "./routes/course.routes";
import adminRouter from "./routes/admin.routes";

import express, { Express, NextFunction, Request, Response } from "express";
import createHttpError, { isHttpError } from "http-errors";

const app: Express = express();

app.use(cors());
app.use(express.static("uploads"));
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/course", courseRouter);
app.use("/api/admin/", adminRouter);

app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "An unknown error occured";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  return res.status(statusCode).json({ error: errorMessage });
});

export default app;
