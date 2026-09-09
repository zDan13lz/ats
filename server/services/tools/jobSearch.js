import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractJSON(text) {
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  throw new Error("Could not extract JSON from response");
}

export async function findJobs(skills, jobTitles, location, preferences) {
  const title = jobTitles[0] || "relevant role";
  const title2 = jobTitles[1] || "";
  console.log(`[JobSearch] Searching: ${title} in ${location || "US"}`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{
      role: "user",
      content: `Find SPECIFIC, INDIVIDUAL job postings for "${title}" ${title2 ? `and "${title2}" ` : ""}${location ? `in or near ${location}` : ""}.

CRITICAL RULES FOR SEARCHING:
1. Search MULTIPLE job boards — use separate searches for each:
   - Search: "${title} jobs ${location || ""} site:linkedin.com/jobs"
   - Search: "${title} jobs ${location || ""} site:ziprecruiter.com"
   - Search: "${title} hiring ${location || ""}"
   ${title2 ? `- Search: "${title2} jobs ${location || ""}"` : ""}
2. Find DIRECT links to INDIVIDUAL job postings, NOT search result pages
   - GOOD: linkedin.com/jobs/view/12345, ziprecruiter.com/c/Company/Job/Title/abc123, greenhouse.io/job/12345
   - BAD: indeed.com/q-training-manager-jobs.html, indeed.com/jobs?q=training (these are SEARCH PAGES, not job postings)
3. If you can only find a search results page, do NOT include that URL. Leave url as empty string instead.
4. Aim for 5-8 real individual postings across different companies and platforms.

After searching, respond with ONLY this JSON:
{
  "jobs": [
    {
      "title": "exact posted title",
      "company": "company name",
      "location": "city, state or Remote",
      "url": "direct link to THIS SPECIFIC job posting, or empty string if only search page found",
      "source": "linkedin|ziprecruiter|greenhouse|company site|other",
      "salary_range": "if mentioned, otherwise empty string",
      "why_apply": "one sentence connecting candidate's ${skills.slice(0, 3).join(', ')} experience to this role"
    }
  ],
  "search_summary": "one sentence market overview",
  "suggested_search_terms": ["term1", "term2"],
  "job_board_links": [
    {"board": "LinkedIn", "url": "direct search URL for this role on LinkedIn"},
    {"board": "ZipRecruiter", "url": "direct search URL on ZipRecruiter"},
    {"board": "Indeed", "url": "direct search URL on Indeed"}
  ]
}`,
    }],
  });

  const allText = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  try {
    const clean = allText.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}

  console.log(`[JobSearch] Formatting fallback...`);
  const format = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `Extract job listings from this text. Return ONLY JSON, nothing else:

${allText.slice(0, 4000)}

Format: {"jobs":[{"title":"","company":"","location":"","url":"","source":"","salary_range":"","why_apply":""}],"search_summary":"","suggested_search_terms":[],"job_board_links":[{"board":"","url":""}]}

IMPORTANT: Only include URLs that link to a SPECIFIC individual job posting. If a URL is a search results page (contains /q- or ?q= or /jobs?), set url to empty string.`,
    }],
  });

  const raw = format.content.map((b) => b.text || "").join("");
  const m = raw.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
  if (m) return JSON.parse(m[0]);
  throw new Error("Could not parse job search results");
}