import type { IndexStore } from "./indexer.js";
import { tokenize } from "./indexer.js";
import type { SearchMatch, SearchResponse } from "./types.js";

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


export function searchIndex(query: string, store: IndexStore): SearchResponse {
  const terms = [...new Set(tokenize(query).filter((word) => !STOP_WORDS.has(word)))];

  const matches = new Set<string>();
  for (const term of terms) {
    const bucket = store.index.get(term);
    if (!bucket) continue;

    for (const url of bucket) {
      matches.add(url);
    }
  }

  const results: SearchMatch[] = [];
  for (const url of matches) {
    const page = store.pages.get(url);
    if (!page) continue;
    results.push({ url: page.url, title: page.title, terms: page.terms });
  }

  results.sort((a, b) => a.url.localeCompare(b.url));

  return { terms, results, count: results.length };
}
