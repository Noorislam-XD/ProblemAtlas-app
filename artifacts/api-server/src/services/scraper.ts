import { db, opportunitiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { scorePost } from "./gemini.js";
import { logger } from "../lib/logger.js";

const HN_KEYWORDS = [
  "frustrated with",
  "wish there was",
  "why is there no",
  "pain point",
  "annoying that",
  "no good tool",
  "terrible experience",
];

const REDDIT_SUBS = [
  "Entrepreneur",
  "startups",
  "SaaS",
  "webdev",
  "devops",
  "productivity",
];

const REDDIT_KEYWORDS = "pain+point+frustrated+wish+there+was+annoying";

interface HNHit {
  objectID: string;
  title: string;
  story_text?: string;
  url?: string;
  points?: number;
  num_comments?: number;
}

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext?: string;
    url?: string;
    score?: number;
  };
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHNPosts(): Promise<{ id: string; title: string; content: string; url: string }[]> {
  const results: { id: string; title: string; content: string; url: string }[] = [];

  for (const kw of HN_KEYWORDS.slice(0, 3)) {
    try {
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(kw)}&tags=story&hitsPerPage=5&numericFilters=points>10`;
      const res = await fetch(url, { headers: { "User-Agent": "ProblemAtlas/1.0" } });
      if (!res.ok) continue;
      const data = await res.json() as { hits: HNHit[] };
      for (const hit of data.hits ?? []) {
        results.push({
          id: `hn_${hit.objectID}`,
          title: hit.title,
          content: hit.story_text ?? hit.title,
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        });
      }
      await sleep(500);
    } catch (err) {
      logger.warn({ err, kw }, "HN fetch failed");
    }
  }

  return results;
}

async function fetchRedditPosts(): Promise<{ id: string; title: string; content: string; url: string }[]> {
  const results: { id: string; title: string; content: string; url: string }[] = [];

  for (const sub of REDDIT_SUBS.slice(0, 3)) {
    try {
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${REDDIT_KEYWORDS}&sort=new&limit=5&restrict_sr=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "ProblemAtlas/1.0 (research bot)" },
      });
      if (!res.ok) continue;
      const data = await res.json() as { data: { children: RedditPost[] } };
      for (const child of data.data?.children ?? []) {
        const post = child.data;
        results.push({
          id: `reddit_${post.id}`,
          title: post.title,
          content: post.selftext || post.title,
          url: `https://reddit.com${post.url ?? ""}`,
        });
      }
      await sleep(1000);
    } catch (err) {
      logger.warn({ err, sub }, "Reddit fetch failed");
    }
  }

  return results;
}

async function isAlreadyStored(sourceId: string): Promise<boolean> {
  const rows = await db
    .select({ id: opportunitiesTable.id })
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.opportunityId, sourceId));
  return rows.length > 0;
}

export async function runScraper(): Promise<number> {
  logger.info("Scraper: starting run");

  const posts = [
    ...(await fetchHNPosts()),
    ...(await fetchRedditPosts()),
  ];

  logger.info({ count: posts.length }, "Scraper: posts fetched");

  let inserted = 0;

  for (const post of posts) {
    try {
      if (await isAlreadyStored(post.id)) continue;

      await sleep(2000);

      const scored = await scorePost(post.title, post.content);
      if (!scored) continue;

      if (scored.scores.final < 6.0) continue;

      await db.insert(opportunitiesTable).values({
        opportunityId: post.id,
        title: scored.title,
        summary: scored.summary,
        category: scored.category,
        scoresFinal: scored.scores.final,
        scoresFrequency: scored.scores.frequency,
        scoresSeverity: scored.scores.severity,
        scoresMarket: scored.scores.market,
        scoresTrend: scored.scores.trend,
        scoresCompetition: scored.scores.competition,
        scoresFeasibility: scored.scores.feasibility,
        painPoints: scored.painPoints,
        trend: scored.trend,
        market: scored.market,
        competitors: scored.competitors,
        mvp: scored.mvp,
        risks: scored.risks,
        meta: { contributor: "auto-scraper", date: new Date().toISOString().split("T")[0] },
        status: "approved",
        source: post.id.startsWith("hn_") ? "hn" : "reddit",
        sourceUrl: post.url,
      });

      inserted++;
      logger.info({ title: scored.title, score: scored.scores.final }, "Scraper: inserted opportunity");
    } catch (err) {
      logger.warn({ err, postId: post.id }, "Scraper: failed to process post");
    }
  }

  logger.info({ inserted }, "Scraper: run complete");
  return inserted;
}
