import express from "express";
    import cors from "cors";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (err) {
  console.error("Startup failed:", err);
  process.exit(1);
}