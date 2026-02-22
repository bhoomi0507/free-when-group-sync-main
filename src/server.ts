import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { planRoutes } from "./routes/planRoutes.js";
import { AppError } from "./utils/errors.js";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/plans", planRoutes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, "NOT_FOUND", "Route not found."));
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
  });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`LinkUp API listening on port ${port}`);
});
