import type { SearchMatch } from "../api";

export default function ResultCard({ result, position }: { result: SearchMatch; position: number }) {
  return (
    <li className="flex gap-4 border-b border-rule py-4 last:border-b-0">
      <span className="mt-1 w-6 shrink-0 font-mono text-xs text-muted">
        {String(position).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="font-serif text-lg leading-snug text-ink underline-offset-4 transition hover:text-accent hover:underline"
        >
          {result.title || "Untitled page"}
        </a>
        <p className="mt-1 truncate font-mono text-xs text-muted" title={result.url}>
          {result.url}
        </p>
        <p className="mt-1.5 text-xs text-muted">
          {result.terms} term{result.terms === 1 ? "" : "s"} indexed
        </p>
      </div>
    </li>
  );
}
