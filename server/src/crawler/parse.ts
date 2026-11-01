import * as cheerio from "cheerio";
import type { WebPage } from "./types.js";

const IGNORED_TAGS = ["script", "style", "noscript", "desc", "svg"];
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

function resolveLink(href: string, pageUrl: string): string | null {
  try {
    const resolved = new URL(href, pageUrl);
    if (!ALLOWED_PROTOCOLS.has(resolved.protocol)) return null;

    // "#top" and "#section" are the same document; never queue them again.
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return null;
  }
}

export function parsePageContent(html: string, pageUrl: string): WebPage {
  const $ = cheerio.load(html);

  const title = $("title").first().text().replace(/\s+/g, " ").trim();

  $(IGNORED_TAGS.join(",")).remove();

  const content = $("body").text().replace(/\s+/g, " ").trim();
  if (content.length === 0) {
    throw new Error("No valuable content found");
  }

  const links: string[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    const link = resolveLink(href.trim(), pageUrl);
    if (!link || seen.has(link)) return;

    seen.add(link);
    links.push(link);
  });

  return { url: pageUrl, title, content, links };
}
