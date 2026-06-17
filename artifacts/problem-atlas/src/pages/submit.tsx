import { useState } from "react";
import { Layout } from "@/components/layout";
import { useLocation } from "wouter";

const CATEGORIES = [
  { value: "developer-tools", label: "Developer Tools" },
  { value: "productivity", label: "Productivity" },
  { value: "ai", label: "AI" },
  { value: "fintech", label: "Fintech" },
  { value: "saas", label: "SaaS" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

export default function Submit() {
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    summary: "",
    category: "other",
    source_url: "",
    pain_points: "",
    contributor_name: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/opportunities/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source_url: form.source_url || undefined,
          contributor_name: form.contributor_name || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Submission failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-24">
          <div className="text-6xl mb-6">🎯</div>
          <h1 className="text-4xl font-bold mb-4">
            Submission <span className="text-primary">Received!</span>
          </h1>
          <p className="text-muted-foreground font-mono mb-8">
            Thank you for contributing to ProblemAtlas. Your opportunity will be reviewed and scored soon.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-lg bg-primary text-background font-mono font-bold hover:bg-primary/90 transition-colors"
            >
              Browse Opportunities
            </button>
            <button
              onClick={() => { setSuccess(false); setForm({ title: "", summary: "", category: "other", source_url: "", pain_points: "", contributor_name: "" }); }}
              className="px-6 py-3 rounded-lg border border-border font-mono hover:bg-card transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Submit an <span className="text-primary">Opportunity</span>
          </h1>
          <p className="text-muted-foreground font-mono">
            Spotted a real pain point online? Submit it here and help the community find the next big startup idea.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Opportunity Title <span className="text-primary">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={200}
              placeholder="e.g. AI-powered code review for solo developers"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 font-mono focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Summary <span className="text-primary">*</span>
            </label>
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              required
              minLength={20}
              maxLength={1000}
              rows={3}
              placeholder="Describe the problem and the opportunity in 2-3 sentences..."
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 font-mono focus:outline-none focus:border-primary/60 transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Category <span className="text-primary">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-mono focus:outline-none focus:border-primary/60 transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Pain Points <span className="text-primary">*</span>
            </label>
            <p className="text-xs text-muted-foreground/70 font-mono">One pain point per line. Be specific — paste real quotes from forums/issues if you have them.</p>
            <textarea
              name="pain_points"
              value={form.pain_points}
              onChange={handleChange}
              required
              minLength={10}
              rows={4}
              placeholder={"\"I've spent 3 hours debugging this and there's no good tool\"\n\"Every team I know does this manually, it's ridiculous\"\nNo visibility into why the process fails"}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 font-mono text-sm focus:outline-none focus:border-primary/60 transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Source URL <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              name="source_url"
              value={form.source_url}
              onChange={handleChange}
              type="url"
              placeholder="https://news.ycombinator.com/item?id=... or Reddit/GitHub link"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 font-mono focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Your Name / Handle <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              name="contributor_name"
              value={form.contributor_name}
              onChange={handleChange}
              maxLength={100}
              placeholder="@yourhandle or anonymous"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 font-mono focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-primary font-mono text-sm">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-lg bg-primary text-background font-mono font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Opportunity →"}
          </button>

          <p className="text-center text-xs text-muted-foreground/60 font-mono">
            Submissions are reviewed before going live. Quality &gt; quantity.
          </p>
        </form>
      </div>
    </Layout>
  );
}
