import * as cheerio from "cheerio";

export async function scrapeJobUrl(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html",
    },
    redirect: "follow",
  });

  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, nav, footer, header, iframe, noscript").remove();

  // Try common job description selectors
  const selectors = [
    '[class*="job-description"]', '[class*="jobDescription"]',
    '[class*="job_description"]', '[class*="posting-description"]',
    '[id*="job-description"]', '[id*="jobDescription"]',
    '[class*="description"]', "article", '[role="main"]',
    "main", ".content", "#content",
  ];

  let text = "";
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 200) {
      text = el.text().trim();
      break;
    }
  }

  // Fallback to body
  if (!text || text.length < 200) {
    text = $("body").text().trim();
  }

  // Clean whitespace
  text = text.replace(/\s+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  // Truncate if absurdly long
  if (text.length > 8000) text = text.slice(0, 8000);

  return {
    url,
    text,
    length: text.length,
    title: $("title").text().trim() || "",
  };
}