import { Link } from "wouter";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <span className="font-bold text-xl tracking-tight">
              <span className="text-white">Problem</span>
              <span className="text-primary">Atlas</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-mono tracking-wider ml-2 border border-primary/20 group-hover:bg-primary/20 transition-colors">
              Open Dataset
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
