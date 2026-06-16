import { getScoreColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showBar?: boolean;
}

export function ScoreDisplay({ score, label, size = "md", showBar = false }: ScoreDisplayProps) {
  const color = getScoreColor(score);
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-muted-foreground font-mono text-xs uppercase tracking-wider">{label}</span>
        )}
        <span 
          className={cn("font-mono font-bold", {
            "text-sm": size === "sm",
            "text-base": size === "md",
            "text-2xl": size === "lg",
          })}
          style={{ color }}
        >
          {score.toFixed(1)}
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(score / 10) * 100}%`, backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
}
