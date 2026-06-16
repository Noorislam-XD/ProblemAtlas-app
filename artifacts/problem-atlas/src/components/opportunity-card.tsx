import { Link } from "wouter";
import { Opportunity } from "@workspace/api-client-react";
import { getCategoryColor, formatTrendDirection } from "@/lib/colors";
import { ScoreDisplay } from "@/components/score-display";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Github } from "lucide-react";

interface OpportunityCardProps {
  opportunity: Opportunity;
  rank?: number;
  index?: number;
}

export function OpportunityCard({ opportunity, rank, index = 0 }: OpportunityCardProps) {
  const categoryColor = getCategoryColor(opportunity.category);
  const trend = formatTrendDirection(opportunity.trend?.direction);

  return (
    <Card 
      className="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      style={{ animationDelay: `${index * 50}ms` }}
      data-testid={`card-opportunity-${opportunity.id}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {rank && (
              <span className="text-muted-foreground font-mono text-xl opacity-50 font-bold">
                #{rank.toString().padStart(2, "0")}
              </span>
            )}
            <Badge 
              variant="outline" 
              className="bg-background/50 uppercase font-mono tracking-wider text-[10px]"
              style={{ borderColor: categoryColor, color: categoryColor }}
            >
              {opportunity.category?.replace("-", " ") || "Unknown"}
            </Badge>
            {opportunity.trend?.direction && (
              <Badge variant="outline" className="bg-background/50 font-mono text-xs border-border flex items-center gap-1">
                <span style={{ color: trend.color }}>{trend.icon}</span>
                <span className="text-muted-foreground">{opportunity.trend.direction}</span>
              </Badge>
            )}
          </div>
          
          {opportunity._meta?.contributor && (
            <a 
              href={`https://github.com/${opportunity._meta.contributor.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="w-3.5 h-3.5" />
              {opportunity._meta.contributor}
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8">
          <div>
            <Link href={`/opportunity/${opportunity.id}`} className="block group-hover:text-primary transition-colors">
              <h3 className="text-2xl font-bold mb-3 line-clamp-2 leading-tight">
                {opportunity.title}
              </h3>
            </Link>
            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed max-w-3xl">
              {opportunity.summary}
            </p>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {opportunity.pain_points.slice(0, 2).map((pp, i) => (
                <div key={i} className="bg-muted/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground border border-border/50 max-w-full truncate">
                  <span className="text-foreground font-bold mr-1">{pp.severity}/10</span> {pp.title}
                </div>
              ))}
              {opportunity.pain_points.length > 2 && (
                <div className="bg-muted/50 rounded-md px-3 py-1.5 text-xs text-muted-foreground border border-border/50">
                  +{opportunity.pain_points.length - 2} more
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 border-l border-border/50 pl-8">
            <div>
              <ScoreDisplay score={opportunity.scores.final} label="Final Score" size="lg" />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <ScoreDisplay score={opportunity.scores.market} label="Market" size="sm" showBar />
              <ScoreDisplay score={opportunity.scores.severity} label="Pain" size="sm" showBar />
              <ScoreDisplay score={opportunity.scores.competition} label="Comp" size="sm" showBar />
              <ScoreDisplay score={opportunity.scores.feasibility} label="Feas" size="sm" showBar />
            </div>
            
            <Link 
              href={`/opportunity/${opportunity.id}`} 
              className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-bold py-2.5 px-4 rounded-md transition-colors"
            >
              View Detail <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
