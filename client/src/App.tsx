import { useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import CrawlForm from "./components/CrawlForm";
import SearchPanel from "./components/SearchPanel";
import type { CrawlReport } from "./api";

function App() {
  const [report, setReport] = useState<CrawlReport | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-rule">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl leading-none tracking-tight text-ink">WebScout</h1>
            <p className="mt-2 text-sm text-muted">
              A breadth-first crawler with a small inverted index.
            </p>
          </div>

          <div className="flex items-center justify-between gap-6 sm:justify-end">
            <nav aria-label="Main" className="flex gap-5 text-sm">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `border-b pb-1 transition ${
                    isActive
                      ? "border-accent text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`
                }
              >
                Search
              </NavLink>
              <NavLink
                to="/crawl"
                className={({ isActive }) =>
                  `border-b pb-1 transition ${
                    isActive
                      ? "border-accent text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`
                }
              >
                Crawl
              </NavLink>
            </nav>

            <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:block">
              {report
                ? `${report.pagesCrawled} pages · ${report.termsIndexed} terms`
                : "index empty"}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:py-12">
        <Routes>
          <Route
            path="/"
            element={
              <section aria-labelledby="search-heading" className="mx-auto w-full max-w-3xl">
                <SearchPanel hasIndex={(report?.pagesCrawled ?? 0) > 0} />
              </section>
            }
          />
          <Route
            path="/crawl"
            element={
              <section aria-labelledby="crawl-heading" className="mx-auto w-full max-w-xl">
                <CrawlForm report={report} onComplete={setReport} />
              </section>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto w-full max-w-6xl px-6 py-5">
          <p className="text-xs text-muted">
            The index is kept in server memory for now and resets when the server restarts.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
