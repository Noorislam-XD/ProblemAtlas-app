import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import { db, opportunitiesTable } from "@workspace/db";

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (!adminPassword) {
    res.status(503).json({ error: "Admin access not configured. Set ADMIN_PASSWORD env var." });
    return;
  }
  const provided = req.headers["x-admin-password"];
  if (provided !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.use("/admin", requireAdmin);

router.get("/admin/submissions", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.status, "pending"))
    .orderBy(desc(opportunitiesTable.createdAt));

  res.json(
    rows.map((r) => ({
      id: r.opportunityId,
      title: r.title,
      summary: r.summary,
      category: r.category,
      source: r.source,
      source_url: r.sourceUrl,
      pain_points: r.painPoints,
      status: r.status,
      meta: r.meta,
      created_at: r.createdAt,
    })),
  );
});

router.patch("/admin/submissions/:id/approve", async (req, res): Promise<void> => {
  const id = req.params["id"];
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }

  await db
    .update(opportunitiesTable)
    .set({ status: "approved" })
    .where(eq(opportunitiesTable.opportunityId, id));

  res.json({ success: true });
});

router.patch("/admin/submissions/:id/reject", async (req, res): Promise<void> => {
  const id = req.params["id"];
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }

  await db
    .update(opportunitiesTable)
    .set({ status: "rejected" })
    .where(eq(opportunitiesTable.opportunityId, id));

  res.json({ success: true });
});

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const all = await db.select().from(opportunitiesTable);
  const byStatus: Record<string, number> = {};
  for (const r of all) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  }
  res.json({ byStatus, total: all.length });
});

export default router;
