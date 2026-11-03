import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { searchIndex, type SearchResponse } from "../api";
import ResultCard from "./ResultCard";

export default function SearchPanel({
  hasIndex,
  statsChecked,
}: {
  hasIndex: boolean;
  statsChecked: boolean;
}) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [submitted, setSubmitted] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length === 0) return;

    setError(null);
    setIsSearching(true);

    try {
      setResponse(await searchIndex(trimmed));
      setSubmitted(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The search could not be completed.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div>
      <h2 id="search-heading" className="font-nunito text-2xl font-extrabold">
        Search the index
      </h2>
      

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="query" className="sr-only">
          Search query
        </label>
        <input
          id="query"
          name="q"
          type="search"
          required
          disabled={!hasIndex}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={hasIndex ? "Try a word you saw on the page" : "Crawl a site first"}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-sm border border-rule bg-card px-4 text-base font-nunito text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!hasIndex || isSearching}
          className="h-12 shrink-0 rounded-sm bg-accent px-6 text-sm font-medium text-card transition hover:bg-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSearching ? "Searching…" : "Search"}
        </button>
      </form>

     

      {error ? (
        <p role="alert" className="mt-5 border-l-2 border-danger pl-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {!hasIndex ? (
        statsChecked ? (
          <div className="mt-9 rounded-sm border border-dashed border-rule px-5 py-6">
            <p className="text-sm">The index is empty.</p>
            <Link
              to="/crawl"
              className="mt-3 inline-block text-sm font-medium text-accent underline-offset-4 transition hover:underline"
            >
              Crawl a site to build the index →
            </Link>
          </div>
        ) : (
          <p className="mt-9 text-sm text-muted">Checking the index…</p>
        )
      ) : (
        <div aria-live="polite" className="mt-9">
          {response === null ? (
            <p className="border-t border-rule pt-6 text-sm text-muted">
              Results will appear here after your first search.
            </p>
          ) : response.results.length === 0 ? (
            <div className="border-t border-rule pt-6">
              <p className="text-sm">
                {response.terms.length === 0
                  ? "That query only contains stop words, so there was nothing to look up."
                  : `No indexed page contains “${submitted}”.`}
              </p>
              {response.terms.length > 0 ? (
                <p className="mt-2 font-mono text-xs text-muted">
                  Looked up: {response.terms.join(", ")}
                </p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-rule pt-5 font-nunito">
                <p className="text-sm">
                  {response.count} result{response.count === 1 ? "" : "s"} for{" "}
                  <span className="font-medium">“{submitted}”</span>
                </p>
                <p className="font-mono text-xs text-muted">
                  lookup: {response.terms.join(", ") || "none"}
                </p>
              </div>

              <ol className="mt-1">
                {response.results.map((result, index) => (
                  <ResultCard key={result.url} result={result} position={index + 1} />
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
