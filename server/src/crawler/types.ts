export interface WebPage {
  url: string;
  title: string;
  content: string;
  links: string[];
}

export interface PageSummary {
  url: string;
  title: string;
  terms: number;
}

export interface CrawlFailure {
  url: string;
  reason: string;
}

export interface CrawlReport {
  startUrl: string;
  pagesCrawled: number;
  termsIndexed: number;
  pages: PageSummary[];
  failures: CrawlFailure[];
}

export interface SearchMatch {
  url: string;
  title: string;
  terms: number;
}

export interface SearchResponse {
  /** Query words that were actually looked up (stop words removed). */
  terms: string[];
  results: SearchMatch[];
  count: number;
}
