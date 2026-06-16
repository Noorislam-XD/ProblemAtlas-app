export function getScoreColor(score: number): string {
  if (score >= 7.5) return "#00e5a0"; // Green
  if (score >= 5.5) return "#ffd60a"; // Yellow
  return "#ff4d6d"; // Red
}

export function getCategoryColor(category: string | undefined): string {
  if (!category) return "#8888aa";
  const colors: Record<string, string> = {
    "developer-tools": "#4d9fff",
    "productivity": "#00e5a0",
    "ai": "#a855f7",
    "fintech": "#ffd60a",
    "saas": "#ff8c42",
    "health": "#ff4d6d",
    "education": "#00e5a0",
    "other": "#8888aa",
  };
  return colors[category] || "#8888aa";
}

export function formatTrendDirection(direction: string | undefined) {
  if (direction === "rising") return { icon: "↑", color: "#00e5a0" };
  if (direction === "declining") return { icon: "↓", color: "#ff4d6d" };
  return { icon: "→", color: "#ffd60a" }; // stable
}
