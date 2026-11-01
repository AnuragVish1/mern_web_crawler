import type { PageSummary, WebPage } from "./types.js";

/** term -> set of pages that contain it */
export type InvertedIndex = Map<string, Set<string>>;

/** Splits text into lowercase words, not ising punctuation. */
export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export class IndexStore {
  readonly index: InvertedIndex = new Map();
  readonly pages = new Map<string, PageSummary>();

  addPage(page: WebPage): number {
    // ensuring no duplicate terms
    const terms = new Set(tokenize(page.content));

    for (const term of terms) {
      const bucket = this.index.get(term);
      if (bucket) {
        bucket.add(page.url);
      } else {
        this.index.set(term, new Set([page.url]));
      }
    }

    this.pages.set(page.url, { url: page.url, title: page.title, terms: terms.size });
    return terms.size;
  }
}
