import { Router } from "express";
import { crawl } from "./crawler/crawler.js";
import { IndexStore } from "./crawler/indexer.js";
import { searchIndex } from "./crawler/search.js";


const store = new IndexStore();

export const api = Router();

api.post("/crawl", async (req, res) => {
  const body = req.body as { url?: unknown; maxPages?: unknown } | undefined;
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

  if (rawUrl.length === 0) {
    res.status(400).json({ error: "Provide a starting URL." });
    return;
  }

  let startUrl: URL;
  try {
    startUrl = new URL(rawUrl);
  } catch {
    res.status(400).json({ error: "That is not a valid URL. Include http:// or https://." });
    return;
  }

  if (startUrl.protocol !== "http:" && startUrl.protocol !== "https:") {
    res.status(400).json({ error: "Only http:// and https:// URLs can be crawled." });
    return;
  }
  startUrl.hash = "";

  let maxPages: number | undefined;
  if (body?.maxPages !== undefined && body.maxPages !== null) {
    if (typeof body.maxPages !== "number" || !Number.isFinite(body.maxPages)) {
      res.status(400).json({ error: "Maximum pages must be a number." });
      return;
    }
    maxPages = body.maxPages;
  }

  const report = await crawl(startUrl.toString(), store, { maxPages });
  res.json(report);
});

api.get("/search", (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (query.length === 0) {
    res.status(400).json({ error: "Enter a search query." });
    return;
  }

  res.json(searchIndex(query, store));
});
