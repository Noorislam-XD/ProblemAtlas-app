import { useState } from "react";
import { 
  useListOpportunities, 
  useGetStats, 
  useListCategories, 
  ListOpportunitiesSortBy 
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { OpportunityCard } from "@/components/opportunity-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, Activity, Users, Database } from "lucide-react";
import { getCategoryColor } from "@/lib/colors";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<ListOpportunitiesSortBy>("score");
  const [minScore, setMinScore] = useState([0]);

  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: categories, isLoading: categoriesLoading } = useListCategories();
  
  const { data: opportunities, isLoading: oppsLoading } = useListOpportunities({
    search: debouncedSearch || undefined,
    category,
    sortBy,
    minScore: minScore[0] > 0 ? minScore[0] : undefined
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 border-b border-border/50 mb-12">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
          Real complaints.<br />
          <span className="text-primary">Unmet needs.</span><br />
          Backed by data.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-12 font-mono">
          A community-driven dataset of startup opportunities extracted from the internet's most severe pain points. No hunches, just signal.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
          <div className="bg-card border border-border p-4 rounded-lg flex flex-col gap-2">
            <div className="text-muted-foreground flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
              <Database className="w-4 h-4 text-primary" /> Opportunities
            </div>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-bold font-mono">{stats?.total_opportunities || 0}</div>
            )}
          </div>
          <div className="bg-card border border-border p-4 rounded-lg flex flex-col gap-2">
            <div className="text-muted-foreground flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#00e5a0]" /> Contributors
            </div>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-bold font-mono">{stats?.total_contributors || 0}</div>
            )}
          </div>
          <div className="bg-card border border-border p-4 rounded-lg flex flex-col gap-2">
            <div className="text-muted-foreground flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
              <Activity className="w-4 h-4 text-[#ffd60a]" /> Avg Score
            </div>
            {statsLoading ? <Skeleton className="h-8 w-20" /> : (
              <div className="text-3xl font-bold font-mono">{stats?.avg_score?.toFixed(1) || "0.0"}</div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <div className="flex flex-wrap gap-3">
          <Badge 
            variant="outline"
            className={`cursor-pointer px-4 py-2 font-mono text-sm border-border hover:bg-secondary transition-colors ${!category ? 'bg-secondary' : 'bg-transparent'}`}
            onClick={() => setCategory(undefined)}
            data-testid="filter-category-all"
          >
            ALL
          </Badge>
          {categoriesLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-32 rounded-full" />)
          ) : (
            categories?.map(c => {
              const color = getCategoryColor(c.category);
              return (
                <Badge 
                  key={c.category}
                  variant="outline"
                  className={`cursor-pointer px-4 py-2 font-mono text-sm transition-colors border`}
                  style={{ 
                    borderColor: category === c.category ? color : 'var(--border)',
                    backgroundColor: category === c.category ? `${color}15` : 'transparent',
                    color: category === c.category ? color : 'var(--foreground)'
                  }}
                  onClick={() => setCategory(c.category === category ? undefined : c.category)}
                  data-testid={`filter-category-${c.category}`}
                >
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
                  {c.category.replace("-", " ")}
                  <span className="ml-2 opacity-50">{c.count}</span>
                </Badge>
              )
            })
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="mb-8 flex flex-col md:flex-row gap-4 items-end bg-card p-4 rounded-lg border border-border">
        <div className="w-full md:w-1/3 space-y-2">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, summary..." 
              className="pl-9 bg-background font-mono text-sm"
              data-testid="input-search"
            />
          </div>
        </div>
        
        <div className="w-full md:w-1/4 space-y-2">
          <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Sort By</label>
          <Select value={sortBy} onValueChange={(v: ListOpportunitiesSortBy) => setSortBy(v)}>
            <SelectTrigger className="bg-background font-mono text-sm" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Highest Score</SelectItem>
              <SelectItem value="severity">Highest Pain Severity</SelectItem>
              <SelectItem value="market">Largest Market</SelectItem>
              <SelectItem value="trend">Strongest Trend</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/4 space-y-4 px-2 pb-2">
          <div className="flex justify-between">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Min Score</label>
            <span className="text-xs font-mono font-bold text-primary">{minScore[0].toFixed(1)}</span>
          </div>
          <Slider 
            value={minScore} 
            onValueChange={setMinScore} 
            max={10} 
            step={0.5} 
            className="[&_[role=slider]]:bg-primary"
            data-testid="slider-minscore"
          />
        </div>
      </section>

      {/* List */}
      <section className="space-y-4">
        {oppsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 h-[250px]">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))
        ) : opportunities?.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border border-dashed rounded-xl">
            <div className="text-muted-foreground font-mono text-sm uppercase tracking-wider mb-2">No opportunities found</div>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          opportunities?.map((opp, index) => (
            <OpportunityCard 
              key={opp.id} 
              opportunity={opp} 
              rank={index + 1}
              index={index}
            />
          ))
        )}
      </section>
    </Layout>
  );
}
