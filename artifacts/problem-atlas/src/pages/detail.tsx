import { useParams, Link } from "wouter";
import { useGetOpportunity, getGetOpportunityQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ScoreDisplay } from "@/components/score-display";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryColor, formatTrendDirection } from "@/lib/colors";
import { ArrowLeft, Target, ShieldAlert, Zap, Quote, Code, ArrowUpRight } from "lucide-react";

export default function Detail() {
  const { id } = useParams();
  const { data: opp, isLoading } = useGetOpportunity(id || "", {
    query: { enabled: !!id, queryKey: getGetOpportunityQueryKey(id || "") }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8 animate-pulse">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-20 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!opp) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Opportunity not found</h2>
          <Link href="/" className="text-primary hover:underline">Return home</Link>
        </div>
      </Layout>
    );
  }

  const categoryColor = getCategoryColor(opp.category);
  const trend = formatTrendDirection(opp.trend?.direction);

  return (
    <Layout>
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm uppercase tracking-wider mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </Link>
        
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Badge 
            variant="outline" 
            className="bg-background uppercase font-mono tracking-wider text-xs border border-border"
            style={{ color: categoryColor, borderColor: categoryColor }}
          >
            {opp.category?.replace("-", " ")}
          </Badge>
          {opp.trend && (
            <Badge variant="outline" className="bg-background font-mono text-xs border-border flex items-center gap-1">
              <span style={{ color: trend.color }}>{trend.icon}</span>
              <span className="text-muted-foreground">{opp.trend.direction}</span>
              <span className="text-muted-foreground ml-2 border-l border-border pl-2">Momentum: <span className="text-foreground">{opp.trend.momentum_score}/10</span></span>
            </Badge>
          )}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" data-testid={`text-title-${opp.id}`}>
          {opp.title}
        </h1>
        <p className="text-xl text-muted-foreground max-w-4xl leading-relaxed">
          {opp.summary}
        </p>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="col-span-2 md:col-span-1 bg-card border border-border rounded-xl p-4 flex items-center justify-center">
          <ScoreDisplay score={opp.scores.final} label="Final Score" size="lg" />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <ScoreDisplay score={opp.scores.severity} label="Severity" showBar />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <ScoreDisplay score={opp.scores.frequency} label="Frequency" showBar />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <ScoreDisplay score={opp.scores.market} label="Market" showBar />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <ScoreDisplay score={opp.scores.competition} label="Competition" showBar />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <ScoreDisplay score={opp.scores.feasibility} label="Feasibility" showBar />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="lg:col-span-2 space-y-8">
          {/* Pain Points */}
          <section className="bg-card border border-border rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Pain Points
            </h2>
            <div className="space-y-6">
              {opp.pain_points.map((pp, i) => (
                <div key={i} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="bg-destructive/20 text-destructive font-mono font-bold px-2 py-1 rounded text-sm shrink-0">
                      {pp.severity}/10
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">{pp.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{pp.description}</p>
                      
                      {pp.quotes && pp.quotes.length > 0 && (
                        <div className="space-y-2 mt-4 bg-background/50 p-4 rounded-lg border border-border/50">
                          {pp.quotes.map((quote, qi) => (
                            <div key={qi} className="flex gap-2 text-sm italic text-muted-foreground">
                              <Quote className="w-4 h-4 shrink-0 mt-0.5 text-primary/50" />
                              <p>"{quote}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MVP */}
          {opp.mvp && (
            <section className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Code className="w-5 h-5 text-[#4d9fff]" /> Minimum Viable Product
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">{opp.mvp.title}</h3>
                  <p className="text-muted-foreground">{opp.mvp.description}</p>
                </div>
                
                {opp.mvp.core_features && (
                  <div>
                    <h4 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-3">Core Features</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {opp.mvp.core_features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {opp.mvp.tech_stack && (
                    <div className="bg-background border border-border rounded-lg p-4">
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">Suggested Tech</h4>
                      <div className="flex flex-wrap gap-2">
                        {opp.mvp.tech_stack.map((t, i) => (
                          <span key={i} className="text-xs bg-secondary px-2 py-1 rounded text-secondary-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {opp.mvp.time_to_mvp && (
                    <div className="bg-background border border-border rounded-lg p-4 flex flex-col justify-center">
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">Time to MVP</h4>
                      <div className="text-lg font-bold font-mono text-[#00e5a0]">{opp.mvp.time_to_mvp}</div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          {/* Market */}
          {opp.market && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00e5a0]" /> Market Profile
              </h2>
              <div className="space-y-4 font-mono text-sm">
                {opp.market.tam_estimate && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">TAM</span>
                    <span className="font-bold text-[#00e5a0]">{opp.market.tam_estimate}</span>
                  </div>
                )}
                {opp.market.willingness_to_pay && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">WTP</span>
                    <span className="font-bold">{opp.market.willingness_to_pay}</span>
                  </div>
                )}
                {opp.market.revenue_potential && (
                  <div className="flex justify-between items-center border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Rev Potential</span>
                    <span className="font-bold">{opp.market.revenue_potential}/10</span>
                  </div>
                )}
                {opp.market.target_segments && (
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-2">Target Segments</span>
                    <div className="flex flex-wrap gap-2">
                      {opp.market.target_segments.map((s, i) => (
                        <span key={i} className="bg-background border border-border px-2 py-1 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Competitors */}
          {opp.competitors && opp.competitors.length > 0 && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ffd60a]" /> Competition
              </h2>
              <div className="space-y-4">
                {opp.competitors.map((comp, i) => (
                  <div key={i} className="bg-background border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold font-mono">{comp.name}</h4>
                      <Badge variant="outline" className={`text-[10px] ${comp.market_position === 'dominant' ? 'text-destructive border-destructive/50' : 'text-muted-foreground'}`}>
                        {comp.market_position}
                      </Badge>
                    </div>
                    {comp.weaknesses && (
                      <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                        {comp.weaknesses.map((w, wi) => <li key={qi}>{w}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Risks */}
          {opp.risks && (
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-destructive">
                <ShieldAlert className="w-4 h-4" /> Bear Case
              </h2>
              {opp.risks.risks && (
                <div className="mb-4">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Risks</h4>
                  <ul className="text-sm list-disc pl-4 space-y-1 text-muted-foreground">
                    {opp.risks.risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {opp.risks.assumptions && (
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">Core Assumptions</h4>
                  <ul className="text-sm list-disc pl-4 space-y-1 text-muted-foreground">
                    {opp.risks.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Meta */}
          {opp._meta && (
            <section className="text-xs font-mono text-muted-foreground bg-background border border-border rounded-xl p-4">
              {opp._meta.contributor && (
                <div className="mb-1">
                  Contributor: <a href={`https://github.com/${opp._meta.contributor.replace("@", "")}`} target="_blank" className="text-foreground hover:text-primary transition-colors inline-flex items-center gap-1">{opp._meta.contributor} <ArrowUpRight className="w-3 h-3" /></a>
                </div>
              )}
              {opp._meta.date && <div className="mb-1">Date: {opp._meta.date}</div>}
              {opp._meta.query && <div className="mb-1">Query: {opp._meta.query}</div>}
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}
