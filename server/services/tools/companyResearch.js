import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text); } catch {}
  // Find JSON object in text
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  throw new Error("Could not extract JSON from response");
}

export async function researchCompany(companyName) {
  // Step 1: research with web search
  const research = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{
      role: "user",
      content: `Research "${companyName}" as a potential employer. Search for recent news, company culture, size, and interview tips.`,
    }],
  });

  const researchText = research.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  // Step 2: format into JSON (no tools)
  const format = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `Based on this research about ${companyName}, return ONLY a JSON object with no other text:

${researchText}

JSON format:
{
  "company": "${companyName}",
  "overview": "<2-3 sentence description>",
  "industry": "<industry>",
  "size": "<employee count or range>",
  "headquarters": "<location>",
  "recent_news": ["headline 1", "headline 2"],
  "culture_notes": ["note about culture or values"],
  "interview_tips": ["company-specific interview tip"],
  "glassdoor_sentiment": "<positive|mixed|negative|unknown>"
}`,
    }],
  });

  const raw = format.content.map((b) => b.text || "").join("");
  return extractJSON(raw.replace(/```json|```/g, "").trim());
}