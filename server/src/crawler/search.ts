import { Page } from "../models/Page.js";
import { tokenize } from "./indexer.js";
import type { SearchMatch, SearchResponse } from "./types.js";

/** Same stop-word list as searchIndex.go. */
const STOP_WORDS = new Set([
  "a", "an", "the",
  "and", "or", "but",
  "is", "are", "was", "were",
  "be", "been", "being",
  "am",
  "to", "of", "in", "on", "at",
  "for", "with", "by", "from",
  "as", "into", "about",
  "this", "that", "these", "those",
  "it", "its",
  "he", "she", "they", "we", "i", "you",
  "his", "her", "their", "our", "your", "my",
]);

export async function searchIndex(query: string): Promise<SearchResponse> {
  const terms = [...new Set(tokenize(query).filter((word) => !STOP_WORDS.has(word)))];

  if (terms.length === 0) {
    return { terms, results: [], count: 0 };
  }

    const pages = await Page.find(
      { terms: { $in: terms } },
      { url: 1, title: 1, termCount: 1, _id: 0 },
    )
      .sort({ url: 1 })
      .limit(100)
      .lean();

  const results: SearchMatch[] = pages.map((page) => ({
    url: page.url,
    title: page.title,
    terms: page.termCount,
  }));

  return { terms, results, count: results.length };
}
