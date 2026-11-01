import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { crawlSite, type CrawlReport } from "../api";

interface CrawlFormProps {
  report: CrawlReport | null;
  onComplete: (report: CrawlReport) => void;
}

export default function CrawlForm({ report, onComplete }: CrawlFormProps) {
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState("20");
  const [isCrawling, setIsCrawling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCrawling(true);

    try {
      const result = await crawlSite(url.trim(), Number(maxPages));
      onComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The crawl could not be started.");
    } finally {
      setIsCrawling(false);
    }
  }

  return (
    <div className="rounded-sm border border-rule bg-card p-5 sm:p-7">
      <h2 id="crawl-heading" className="font-serif text-xl tracking-tight">
        Crawl a site
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Pages are visited breadth-first and stripped down to their visible text before indexing.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="start-url" className="block text-sm font-medium">
            Starting URL
          </label>
          <input
            id="start-url"
            name="url"
            type="text"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            autoComplete="off"
            spellCheck={false}
            className="mt-2 h-11 w-full rounded-sm border border-rule bg-paper px-3 font-mono text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Include the scheme. Links are followed across sites, so the budget can leave the
            starting domain.
          </p>
        </div>

        <div className="w-32">
          <label htmlFor="max-pages" className="block text-sm font-medium">
            Max pages
          </label>
          <input
            id="max-pages"
            name="maxPages"
            type="number"
            min={1}
            max={100}
            required
            value={maxPages}
            onChange={(event) => setMaxPages(event.target.value)}
            className="mt-2 h-11 w-full rounded-sm border border-rule bg-paper px-3 font-mono text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </div>

        <button
          type="submit"
          disabled={isCrawling}
          className="h-11 w-full rounded-sm bg-accent text-sm font-medium text-card transition hover:bg-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCrawling ? "Crawling…" : "Start crawl"}
        </button>
      </form>

      <p aria-live="polite" className="mt-3 text-xs leading-relaxed text-muted">
        {isCrawling
          ? "Fetching pages one at a time. A slow site can take up to 10 seconds per page."
          : "Pages are parsed, stripped of scripts and styles, then indexed by word."}
      </p>

      {error ? (
        <p role="alert" className="mt-4 border-l-2 border-danger pl-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {report ? <CrawlSummary report={report} /> : null}
    </div>
  );
}

function CrawlSummary({ report }: { report: CrawlReport }) {
  return (
    <div className="mt-6 border-t border-rule pt-4">
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Last crawl</h3>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted">Pages indexed</dt>
          <dd className="font-mono text-lg">{report.pagesCrawled}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Terms added</dt>
          <dd className="font-mono text-lg">{report.termsIndexed}</dd>
        </div>
      </dl>

      <p className="mt-3 truncate font-mono text-xs text-muted" title={report.startUrl}>
        {report.startUrl}
      </p>

      {report.failures.length > 0 ? (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-muted transition hover:text-ink">
            {report.failures.length} page{report.failures.length === 1 ? "" : "s"} skipped
          </summary>
          <ul className="mt-2 space-y-2">
            {report.failures.map((failure) => (
              <li key={failure.url} className="break-words leading-relaxed">
                <span className="font-mono text-[11px] text-ink">{failure.url}</span>
                <span className="text-muted"> — {failure.reason}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <p className="mt-4 text-xs text-muted">Every page in the crawl was indexed.</p>
      )}

      <Link
        to="/"
        className="mt-5 inline-block text-sm font-medium text-accent underline-offset-4 transition hover:underline"
      >
        Search the index →
      </Link>
    </div>
  );
}
