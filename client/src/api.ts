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
  terms: string[];
  results: SearchMatch[];
  count: number;
}

export interface Stats {
  pages: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body as T;
}

export function crawlSite(url: string, maxPages: number): Promise<CrawlReport> {
  return request<CrawlReport>("/api/crawl", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url, maxPages }),
  });
}

export function searchIndex(query: string): Promise<SearchResponse> {
  return request<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`);
}

export function getStats(): Promise<Stats> {
  return request<Stats>("/api/stats");
}
