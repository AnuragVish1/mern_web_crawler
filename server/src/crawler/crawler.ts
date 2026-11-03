import type { EventEmitter } from "stream";
import { fetchPage } from "./fetch.js";
import { addPageToIndex } from "./indexer.js";
import { parsePageContent } from "./parse.js";
import type { CrawlFailure, CrawlReport, PageSummary, WebPage } from "./types.js";

export const DEFAULT_MAX_PAGES = 20;
export const HARD_MAX_PAGES = 100;

export interface CrawlOptions {
  maxPages?: number | undefined;
}

function reasonFor(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function clampMaxPages(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return DEFAULT_MAX_PAGES;
  return Math.min(Math.max(Math.trunc(value), 1), HARD_MAX_PAGES);
}

export async function crawl(
  startUrl: string,
  options: CrawlOptions = {},
  bus: EventEmitter
): Promise<CrawlReport> {
  const maxPages = clampMaxPages(options.maxPages);

  const queue: string[] = [startUrl];
  const enqueued = new Set<string>([startUrl]);
  const visited = new Set<string>();

  const pages: PageSummary[] = [];
  const failures: CrawlFailure[] = [];
  let termsIndexed = 0;

  while (queue.length > 0 && visited.size < maxPages) {
    const currentUrl = queue.shift();
    if (currentUrl === undefined) break;
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    let html: string;
    try {
      html = await fetchPage(currentUrl);
    } catch (error) {
      failures.push({ url: currentUrl, reason: reasonFor(error) });
      continue;
    }

    let page: WebPage;
    try {
      page = parsePageContent(html, currentUrl);
    } catch (error) {
      failures.push({ url: currentUrl, reason: reasonFor(error) });
      continue;
    }

    const terms = await addPageToIndex(page);
    termsIndexed += terms;
    pages.push({ url: page.url, title: page.title, terms });

    bus.emit('message', {type: 'pageCrawled', page: {url: page.url, title: page.title, terms}});

    for (const link of page.links) {
      if (enqueued.has(link)) continue;
      enqueued.add(link);
      queue.push(link);
    }
  }

  return {
    startUrl,
    pagesCrawled: pages.length,
    termsIndexed,
    pages,
    failures,
  };
}
