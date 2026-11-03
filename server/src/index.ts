import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { api } from "./routes.js";
import { connectDatabase, disconnectDatabase } from "./db.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", api);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Request failed:", err);
  res.status(500).json({ error: "The server could not complete that request." });
};

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start(): Promise<void> {
  await connectDatabase();

  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`${signal} received. Shutting down.`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
    server.closeAllConnections();
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
