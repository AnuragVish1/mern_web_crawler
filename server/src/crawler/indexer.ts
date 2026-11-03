import { Page } from "../models/Page.js";
import type { WebPage } from "./types.js";

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export async function addPageToIndex(page: WebPage): Promise<number> {
  // One page contributes at most one entry per term.
  const terms = [...new Set(tokenize(page.content))];

  await Page.updateOne(
    { url: page.url },
    {
      $set: {
        title: page.title,
        terms,
        termCount: terms.length,
        lastCrawledAt: new Date(),
      },
    },
    { upsert: true },
  );

  return terms.length;
}
