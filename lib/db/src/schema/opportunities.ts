import { pgTable, text, serial, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const opportunitiesTable = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  opportunityId: text("opportunity_id").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(),
  scoresFinal: real("scores_final").notNull().default(0),
  scoresFrequency: real("scores_frequency").notNull().default(0),
  scoresSeverity: real("scores_severity").notNull().default(0),
  scoresMarket: real("scores_market").notNull().default(0),
  scoresTrend: real("scores_trend").notNull().default(0),
  scoresCompetition: real("scores_competition").notNull().default(0),
  scoresFeasibility: real("scores_feasibility").notNull().default(0),
  painPoints: jsonb("pain_points").notNull().default([]),
  trend: jsonb("trend"),
  market: jsonb("market"),
  competitors: jsonb("competitors").notNull().default([]),
  mvp: jsonb("mvp"),
  risks: jsonb("risks"),
  meta: jsonb("meta"),
  status: text("status").notNull().default("approved"),
  source: text("source").notNull().default("manual"),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOpportunitySchema = createInsertSchema(opportunitiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type OpportunityRow = typeof opportunitiesTable.$inferSelect;
