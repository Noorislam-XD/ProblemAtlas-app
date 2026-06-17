import { Router, type IRouter } from "express";
import { eq, ilike, gte, or, desc, sql } from "drizzle-orm";
import { db, opportunitiesTable } from "@workspace/db";
import {
  ListOpportunitiesQueryParams,
  GetOpportunityParams,
  GetStatsResponse,
  ListCategoriesResponse,
  GetTopOpportunitiesQueryParams,
} from "@workspace/api-zod";
import { runScraper } from "../services/scraper.js";

const router: IRouter = Router();

function rowToOpportunity(row: typeof opportunitiesTable.$inferSelect) {
  return {
    id: row.opportunityId,
    title: row.title,
    summary: row.summary,
    category: row.category,
    scores: {
      final: row.scoresFinal,
      frequency: row.scoresFrequency,
      severity: row.scoresSeverity,
      market: row.scoresMarket,
      trend: row.scoresTrend,
      competition: row.scoresCompetition,
      feasibility: row.scoresFeasibility,
    },
    pain_points: row.painPoints,
    trend: row.trend,
    market: row.market,
    competitors: row.competitors,
    mvp: row.mvp,
    risks: row.risks,
    source: row.source,
    source_url: row.sourceUrl,
    _meta: row.meta,
  };
}

router.get("/opportunities", async (req, res): Promise<void> => {
  const parsed = ListOpportunitiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, search, sortBy, minScore } = parsed.data;

  let query = db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.status, "approved"))
    .$dynamic();

  const conditions: ReturnType<typeof eq>[] = [
    eq(opportunitiesTable.status, "approved"),
  ];

  if (category) {
    conditions.push(eq(opportunitiesTable.category, category));
  }

  if (minScore != null) {
    conditions.push(gte(opportunitiesTable.scoresFinal, minScore));
  }

  if (search) {
    const searchCondition = or(
      ilike(opportunitiesTable.title, `%${search}%`),
      ilike(opportunitiesTable.summary, `%${search}%`),
    );
    if (searchCondition) conditions.push(searchCondition as ReturnType<typeof eq>);
  }

  if (conditions.length > 0) {
    const [first, ...rest] = conditions;
    if (rest.length > 0) {
      query = query.where(sql`${first} AND ${rest.reduce((acc, c) => sql`${acc} AND ${c}`)}`);
    } else {
      query = query.where(first);
    }
  }

  if (sortBy === "newest") {
    query = query.orderBy(desc(opportunitiesTable.createdAt));
  } else if (sortBy === "trend") {
    query = query.orderBy(desc(opportunitiesTable.scoresTrend));
  } else if (sortBy === "market") {
    query = query.orderBy(desc(opportunitiesTable.scoresMarket));
  } else if (sortBy === "severity") {
    query = query.orderBy(desc(opportunitiesTable.scoresSeverity));
  } else {
    query = query.orderBy(desc(opportunitiesTable.scoresFinal));
  }

  const rows = await query;
  res.json(rows.map(rowToOpportunity));
});

router.get("/opportunities/top", async (req, res): Promise<void> => {
  const parsed = GetTopOpportunitiesQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit ? parsed.data.limit : 5;

  const rows = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.status, "approved"))
    .orderBy(desc(opportunitiesTable.scoresFinal))
    .limit(limit);

  res.json(rows.map(rowToOpportunity));
});

router.get("/opportunities/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOpportunityParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.opportunityId, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  res.json(rowToOpportunity(row));
});

const VALID_CATEGORIES = new Set([
  "developer-tools",
  "productivity",
  "ai",
  "fintech",
  "saas",
  "health",
  "education",
  "other",
]);

router.post("/opportunities/submit", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const title = typeof body["title"] === "string" ? body["title"].trim() : "";
  const summary = typeof body["summary"] === "string" ? body["summary"].trim() : "";
  const category = typeof body["category"] === "string" ? body["category"] : "other";
  const source_url = typeof body["source_url"] === "string" ? body["source_url"].trim() : undefined;
  const pain_points = typeof body["pain_points"] === "string" ? body["pain_points"].trim() : "";
  const contributor_name = typeof body["contributor_name"] === "string" ? body["contributor_name"].trim() : undefined;

  if (title.length < 5 || title.length > 200) {
    res.status(400).json({ error: "Title must be between 5 and 200 characters" });
    return;
  }
  if (summary.length < 20 || summary.length > 1000) {
    res.status(400).json({ error: "Summary must be between 20 and 1000 characters" });
    return;
  }
  if (!VALID_CATEGORIES.has(category)) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }
  if (pain_points.length < 10) {
    res.status(400).json({ error: "Pain points must be at least 10 characters" });
    return;
  }

  const id = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await db.insert(opportunitiesTable).values({
    opportunityId: id,
    title,
    summary,
    category,
    scoresFinal: 0,
    scoresFrequency: 0,
    scoresSeverity: 0,
    scoresMarket: 0,
    scoresTrend: 0,
    scoresCompetition: 0,
    scoresFeasibility: 0,
    painPoints: pain_points
      .split("\n")
      .filter(Boolean)
      .map((t: string) => ({ score: "?/10", text: t.trim() })),
    competitors: [],
    meta: {
      contributor: contributor_name ?? "anonymous",
      date: new Date().toISOString().split("T")[0],
    },
    status: "pending",
    source: "manual",
    sourceUrl: source_url ?? null,
  });

  res.status(201).json({ success: true, message: "Submission received — thank you! It will be reviewed shortly." });
});

router.post("/admin/scrape", async (req, res): Promise<void> => {
  try {
    const inserted = await runScraper();
    res.json({ success: true, inserted });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/stats", async (_req, res): Promise<void> => {
  const rows = await db.select().from(opportunitiesTable)
    .where(eq(opportunitiesTable.status, "approved"));

  const totalOpportunities = rows.length;
  const contributors = new Set(
    rows
      .map((r) => (r.meta as { contributor?: string } | null)?.contributor)
      .filter(Boolean),
  );
  const files = new Set(
    rows
      .map((r) => (r.meta as { file?: string } | null)?.file)
      .filter(Boolean),
  );

  const avgScore =
    totalOpportunities > 0
      ? rows.reduce((sum, r) => sum + r.scoresFinal, 0) / totalOpportunities
      : 0;

  const dates = rows
    .map((r) => (r.meta as { date?: string } | null)?.date)
    .filter(Boolean) as string[];

  dates.sort();
  const lastUpdated = dates.length > 0 ? dates[dates.length - 1] : "";

  const catCount: Record<string, number> = {};
  for (const row of rows) {
    catCount[row.category] = (catCount[row.category] || 0) + 1;
  }
  const topCategory = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

  res.json(
    GetStatsResponse.parse({
      total_opportunities: totalOpportunities,
      total_contributors: contributors.size,
      total_files: files.size,
      last_updated: lastUpdated,
      avg_score: Math.round(avgScore * 10) / 10,
      top_category: topCategory,
    }),
  );
});

router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await db.select().from(opportunitiesTable)
    .where(eq(opportunitiesTable.status, "approved"));

  const catMap: Record<string, { scores: number[]; topTitle: string; topScore: number }> = {};
  for (const row of rows) {
    if (!catMap[row.category]) {
      catMap[row.category] = { scores: [], topTitle: "", topScore: -1 };
    }
    catMap[row.category].scores.push(row.scoresFinal);
    if (row.scoresFinal > catMap[row.category].topScore) {
      catMap[row.category].topScore = row.scoresFinal;
      catMap[row.category].topTitle = row.title;
    }
  }

  const result = Object.entries(catMap).map(([category, data]) => ({
    category,
    count: data.scores.length,
    avg_score:
      data.scores.length > 0
        ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
        : 0,
    top_opportunity_title: data.topTitle || null,
  }));

  result.sort((a, b) => b.count - a.count);
  res.json(ListCategoriesResponse.parse(result));
});

export default router;
