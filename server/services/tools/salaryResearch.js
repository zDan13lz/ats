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

export async function researchSalary(jobTitle, location) {
  // Step 1: research with web search
  const research = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{
      role: "user",
      content: `Research current salary data for "${jobTitle}" in "${location || "United States"}". Find salary ranges from multiple sources.`,
    }],
  });

  const researchText = research.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  // Step 2: format into JSON (no tools)
  const format = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Based on this salary research, return ONLY a JSON object with no other text:

${researchText}

JSON format:
{
  "job_title": "${jobTitle}",
  "location": "${location || "United States"}",
  "salary_low": <number — bottom of range>,
  "salary_mid": <number — median>,
  "salary_high": <number — top of range>,
  "currency": "USD",
  "sources": ["source name"],
  "factors": ["factor that affects pay"],
  "negotiation_tips": ["negotiation tip"]
}`,
    }],
  });

  const raw = format.content.map((b) => b.text || "").join("");
  return extractJSON(raw.replace(/```json|```/g, "").trim());
}