import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger.js";

const apiKey = process.env["GEMINI_API_KEY"];
if (!apiKey) logger.warn("GEMINI_API_KEY not set — AI scoring disabled");

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }) : null;

export interface ScoredOpportunity {
  title: string;
  summary: string;
  category: string;
  scores: {
    final: number;
    frequency: number;
    severity: number;
    market: number;
    trend: number;
    competition: number;
    feasibility: number;
  };
  painPoints: { score: string; text: string }[];
  trend: { direction: string; signals: string[] };
  market: { tam: string; wtp: string; segments: string[] };
  competitors: { name: string; weakness: string }[];
  mvp: { description: string; techStack: string[]; timeToMarket: string };
  risks: { bear_case: string; mitigations: string[] };
}

const SCORING_PROMPT = `You are a startup opportunity analyst. Given the following post/complaint from the internet, determine if it represents a genuine startup opportunity.

If it IS a startup opportunity, respond with a JSON object (no markdown, no code fences) matching this exact schema:
{
  "isOpportunity": true,
  "title": "short opportunity title (5-10 words)",
  "summary": "2-3 sentence description of the opportunity",
  "category": one of: "developer-tools"|"productivity"|"ai"|"fintech"|"saas"|"health"|"education"|"other",
  "scores": {
    "final": number 0-10,
    "frequency": number 0-10 (how often people face this),
    "severity": number 0-10 (how painful it is),
    "market": number 0-10 (market size potential),
    "trend": number 0-10 (is this growing?),
    "competition": number 0-10 (10 = no competition, 0 = very crowded),
    "feasibility": number 0-10 (how buildable is a solution?)
  },
  "painPoints": [{"score": "X/10", "text": "description of pain point"}],
  "trend": {"direction": "rising"|"stable"|"declining", "signals": ["signal1", "signal2"]},
  "market": {"tam": "estimated TAM", "wtp": "estimated WTP per month", "segments": ["segment1"]},
  "competitors": [{"name": "competitor name", "weakness": "key weakness"}],
  "mvp": {"description": "MVP description", "techStack": ["tech1", "tech2"], "timeToMarket": "e.g. 3 months"},
  "risks": {"bear_case": "worst case scenario", "mitigations": ["mitigation1"]}
}

If it is NOT a startup opportunity, respond only with: {"isOpportunity": false}

IMPORTANT: Return ONLY raw JSON. No markdown, no code fences, no explanation.

Post to analyze:
Title: {{TITLE}}
Content: {{CONTENT}}`;

export async function scorePost(
  title: string,
  content: string
): Promise<ScoredOpportunity | null> {
  if (!model) return null;

  const prompt = SCORING_PROMPT.replace("{{TITLE}}", title).replace(
    "{{CONTENT}}",
    content.slice(0, 2000)
  );

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned) as { isOpportunity: boolean } & ScoredOpportunity;

    if (!parsed.isOpportunity) return null;

    const final =
      (parsed.scores.frequency +
        parsed.scores.severity +
        parsed.scores.market +
        parsed.scores.trend +
        parsed.scores.competition +
        parsed.scores.feasibility) /
      6;

    parsed.scores.final = Math.round(final * 10) / 10;

    return parsed;
  } catch (err) {
    logger.warn({ err, title }, "Gemini scoring failed for post");
    return null;
  }
}
