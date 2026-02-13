"use client"

import { cn } from "@/lib/utils"

interface StatBarProps {
  label: string
  value: number
  max: number
  color: "cyan" | "pink" | "yellow" | "green"
  icon: string
}

const colorMap = {
  cyan: {
    bar: "bg-[hsl(var(--neon-cyan))]",
    shadow: "shadow-[0_0_12px_hsl(170_100%_50%/0.5)]",
    text: "text-[hsl(var(--neon-cyan))]",
    track: "bg-[hsl(170_100%_50%/0.1)]",
  },
  pink: {
    bar: "bg-[hsl(var(--neon-pink))]",
    shadow: "shadow-[0_0_12px_hsl(330_100%_60%/0.5)]",
    text: "text-[hsl(var(--neon-pink))]",
    track: "bg-[hsl(330_100%_60%/0.1)]",
  },
  yellow: {
    bar: "bg-[hsl(var(--neon-yellow))]",
    shadow: "shadow-[0_0_12px_hsl(50_100%_55%/0.5)]",
    text: "text-[hsl(var(--neon-yellow))]",
    track: "bg-[hsl(50_100%_55%/0.1)]",
  },
  green: {
    bar: "bg-[hsl(var(--neon-green))]",
    shadow: "shadow-[0_0_12px_hsl(120_70%_50%/0.5)]",
    text: "text-[hsl(var(--neon-green))]",
    track: "bg-[hsl(120_70%_50%/0.1)]",
  },
}

export function StatBar({ label, value, max, color, icon }: StatBarProps) {
  const percentage = Math.min(100, (value / max) * 100)
  const colors = colorMap[color]

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-mono tracking-wider uppercase flex items-center gap-1.5", colors.text)}>
          <span>{icon}</span>
          {label}
        </span>
        <span className={cn("text-xs font-mono tabular-nums", colors.text)}>
          {value}/{max}
        </span>
      </div>
      <div className={cn("h-3 rounded-full overflow-hidden", colors.track)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colors.bar,
            colors.shadow
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
