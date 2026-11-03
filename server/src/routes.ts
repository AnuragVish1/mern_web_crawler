import { Router } from "express";
import { crawl } from "./crawler/crawler.js";
import { searchIndex } from "./crawler/search.js";
import { Page } from "./models/Page.js";
import { EventEmitter } from 'events';
const bus = new EventEmitter();
bus.setMaxListeners(0); // default warns at 10

export const api = Router();

let job: boolean = false;

api.get("/stats", async (_req, res) => {
  res.json({ pages: await Page.countDocuments() });
});

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
  job = true;
  const report = await crawl(startUrl.toString(), { maxPages }, bus);
  bus.emit('message', {type: 'crawlReport', report});
  bus.emit('status', {type: 'crawlStatus', status: 'completed'});
  res.json(report);
});

api.get("/search", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (query.length === 0) {
    res.status(400).json({ error: "Enter a search query." });
    return;
  }

  res.json(await searchIndex(query));
});

api.get("/crawlDetailInfo/events", (req, res) => {

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  })

  res.flushHeaders()

  const send = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  bus.on('message', send)

  req.on('close', () => {
    bus.off('message', send)
  })

})

api.get("/crawlStatus/events", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  })
  res.flushHeaders()

  const send = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  if (job) {
    send({type: 'crawlStatus', status: 'running'})
  }

  if (!job) {
    return res.end();
  }

  bus.on('status', send)
  req.on('close', () => {
    bus.off('status',send)
  })
  
})