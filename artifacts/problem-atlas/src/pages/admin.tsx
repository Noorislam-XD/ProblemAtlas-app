import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";

interface Submission {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  source_url?: string;
  pain_points: { score: string; text: string }[];
  status: string;
  meta?: { contributor?: string; date?: string };
  created_at: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "developer-tools": "#4d9fff",
  productivity: "#00e5a0",
  ai: "#a855f7",
  fintech: "#ffd60a",
  saas: "#ff8c42",
  health: "#ff4d6d",
  education: "#00e5a0",
  other: "#8888aa",
};

function PasswordGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/stats", {
      headers: { "x-admin-password": value },
    });
    if (res.ok) {
      sessionStorage.setItem("admin_pw", value);
      onAuth(value);
    } else {
      setError(true);
    }
  }

  return (
    <Layout>
      <div className="max-w-sm mx-auto py-32 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">
          Enter the admin password to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Admin password"
            className="w-full bg-card border border-border rounded-lg px-4 py-3 font-mono focus:outline-none focus:border-primary/60 transition-colors"
          />
          {error && (
            <p className="text-primary text-sm font-mono">Incorrect password</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-background font-mono font-bold hover:bg-primary/90 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default function Admin() {
  const [password, setPassword] = useState<string | null>(
    () => sessionStorage.getItem("admin_pw"),
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async (pw: string) => {
    setLoading(true);
    try {
      const [subRes, statRes] = await Promise.all([
        fetch("/api/admin/submissions", { headers: { "x-admin-password": pw } }),
        fetch("/api/admin/stats", { headers: { "x-admin-password": pw } }),
      ]);
      if (subRes.ok) setSubmissions(await subRes.json() as Submission[]);
      if (statRes.ok) {
        const s = await statRes.json() as { byStatus: Record<string, number> };
        setStats(s.byStatus);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (password) load(password);
  }, [password, load]);

  async function action(id: string, act: "approve" | "reject") {
    if (!password) return;
    setActionLoading(id + act);
    await fetch(`/api/admin/submissions/${id}/${act}`, {
      method: "PATCH",
      headers: { "x-admin-password": password },
    });
    setActionLoading(null);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  }

  if (!password) return <PasswordGate onAuth={setPassword} />;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              Review and approve community submissions
            </p>
          </div>
          <button
            onClick={() => password && load(password)}
            className="px-4 py-2 border border-border rounded-lg font-mono text-sm hover:bg-card transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "PENDING", value: stats["pending"] ?? 0, color: "#ffd60a" },
            { label: "APPROVED", value: stats["approved"] ?? 0, color: "#00e5a0" },
            { label: "REJECTED", value: stats["rejected"] ?? 0, color: "#ff4d6d" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <span className="text-3xl font-bold font-mono" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground font-mono">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-muted-foreground font-mono">No pending submissions — all clear!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Pending Review ({submissions.length})
            </h2>
            {submissions.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span
                        className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{
                          color: CATEGORY_COLORS[s.category] ?? "#8888aa",
                          borderColor: `${CATEGORY_COLORS[s.category] ?? "#8888aa"}44`,
                          backgroundColor: `${CATEGORY_COLORS[s.category] ?? "#8888aa"}11`,
                        }}
                      >
                        {s.category}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground/60">
                        from {s.meta?.contributor ?? "anonymous"} · {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                    <p className="text-muted-foreground text-sm font-mono leading-relaxed">{s.summary}</p>
                  </div>
                </div>

                {Array.isArray(s.pain_points) && s.pain_points.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground/60 mb-2">Pain Points</p>
                    {s.pain_points.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm font-mono text-muted-foreground">
                        <span className="text-primary mt-0.5">›</span>
                        <span>{p.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {s.source_url && (
                  <a
                    href={s.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-primary/70 hover:text-primary transition-colors"
                  >
                    🔗 {s.source_url.slice(0, 60)}{s.source_url.length > 60 ? "…" : ""}
                  </a>
                )}

                <div className="flex gap-3 pt-2 border-t border-border">
                  <button
                    onClick={() => action(s.id, "approve")}
                    disabled={actionLoading === s.id + "approve"}
                    className="flex-1 py-2.5 rounded-lg bg-[#00e5a0]/10 border border-[#00e5a0]/30 text-[#00e5a0] font-mono text-sm hover:bg-[#00e5a0]/20 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === s.id + "approve" ? "..." : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => action(s.id, "reject")}
                    disabled={actionLoading === s.id + "reject"}
                    className="flex-1 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-mono text-sm hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === s.id + "reject" ? "..." : "✗ Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
