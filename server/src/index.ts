import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { api } from "./routes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api", api);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Request failed:", err);
  res.status(500).json({ error: "The server could not complete that request." });
};

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (err) {
  console.error("Startup failed:", err);
  process.exit(1);
}
