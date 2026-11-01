const USER_AGENT = "WebScout/1.0 (+http://localhost:5000)";
const TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024;

function looksLikeHtml(contentType: string | null): boolean {
  if (!contentType) return true; 
  return /text\/html|application\/xhtml\+xml/i.test(contentType);
}

// ensuring the page is within specific memory limits (important for large pages)
async function readCapped(response: Response): Promise<string> {
  if (!response.body) return "";

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      size += value.byteLength;
      text += decoder.decode(value, { stream: true });

      if (size >= MAX_BYTES) {
        await reader.cancel();
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }

  return text + decoder.decode();
}

export async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (!looksLikeHtml(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  return readCapped(response);
}
