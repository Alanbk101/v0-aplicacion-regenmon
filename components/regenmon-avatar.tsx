"use client"

import { cn } from "@/lib/utils"
import { REGENMON_TYPES, type RegenmonType } from "@/hooks/use-regenmon"

interface RegenmonAvatarProps {
  level: number
  happiness: number
  celebrating: boolean
  type: RegenmonType
}

function getEvolutionIndex(level: number) {
  if (level >= 20) return 4
  if (level >= 15) return 3
  if (level >= 10) return 2
  if (level >= 5) return 1
  return 0
}

function getMoodEmoji(happiness: number) {
  if (happiness >= 80) return "✨"
  if (happiness >= 50) return "💫"
  if (happiness >= 25) return "💧"
  return "💔"
}

const typeGlowMap: Record<RegenmonType, { high: string; low: string; border: string }> = {
  fuego: {
    high: "bg-[hsl(330_100%_60%)]",
    low: "bg-[hsl(330_100%_60%)]",
    border: "border-[hsl(var(--neon-pink))] shadow-[0_0_30px_hsl(330_100%_60%/0.3)]",
  },
  agua: {
    high: "bg-[hsl(170_100%_50%)]",
    low: "bg-[hsl(170_100%_50%)]",
    border: "border-[hsl(var(--neon-cyan))] shadow-[0_0_30px_hsl(170_100%_50%/0.3)]",
  },
  planta: {
    high: "bg-[hsl(120_70%_50%)]",
    low: "bg-[hsl(120_70%_50%)]",
    border: "border-[hsl(var(--neon-green))] shadow-[0_0_30px_hsl(120_70%_50%/0.3)]",
  },
  electrico: {
    high: "bg-[hsl(50_100%_55%)]",
    low: "bg-[hsl(50_100%_55%)]",
    border: "border-[hsl(var(--neon-yellow))] shadow-[0_0_30px_hsl(50_100%_55%/0.3)]",
  },
  sombra: {
    high: "bg-[hsl(280_80%_60%)]",
    low: "bg-[hsl(280_80%_60%)]",
    border: "border-[hsl(280_80%_60%)] shadow-[0_0_30px_hsl(280_80%_60%/0.3)]",
  },
  cosmico: {
    high: "bg-[hsl(200_100%_60%)]",
    low: "bg-[hsl(200_100%_60%)]",
    border: "border-[hsl(200_100%_60%)] shadow-[0_0_30px_hsl(200_100%_60%/0.3)]",
  },
}

export function RegenmonAvatar({ level, happiness, celebrating, type }: RegenmonAvatarProps) {
  const evoIndex = getEvolutionIndex(level)
  const typeData = REGENMON_TYPES[type]
  const evolutionEmoji = typeData.evolutions[evoIndex]
  const evolutionName = typeData.evolutionNames[evoIndex]
  const moodEmoji = getMoodEmoji(happiness)
  const glowColors = typeGlowMap[type]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-500",
            happiness >= 50 ? glowColors.high : "bg-[hsl(var(--neon-pink))]"
          )}
        />

        {/* Avatar container */}
        <div
          className={cn(
            "relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full",
            "border-2 transition-all duration-500",
            glowColors.border,
            celebrating ? "animate-celebrate" : "animate-float"
          )}
          style={{
            background: "radial-gradient(circle at 30% 30%, hsl(240 20% 16%), hsl(240 20% 6%))",
          }}
        >
          <span className="text-6xl md:text-7xl select-none" role="img" aria-label={evolutionName}>
            {evolutionEmoji}
          </span>

          {/* Mood indicator */}
          <span
            className={cn(
              "absolute -top-1 -right-1 text-xl transition-all",
              celebrating && "animate-sparkle"
            )}
          >
            {moodEmoji}
          </span>
        </div>

        {/* Celebration sparkles */}
        {celebrating && (
          <>
            <span className="absolute top-0 left-0 text-lg animate-sparkle" style={{ animationDelay: "0.1s" }}>
              {"⭐"}
            </span>
            <span className="absolute top-0 right-0 text-lg animate-sparkle" style={{ animationDelay: "0.3s" }}>
              {"🌟"}
            </span>
            <span className="absolute bottom-0 left-2 text-lg animate-sparkle" style={{ animationDelay: "0.2s" }}>
              {"✨"}
            </span>
            <span className="absolute bottom-0 right-2 text-lg animate-sparkle" style={{ animationDelay: "0.4s" }}>
              {"💫"}
            </span>
          </>
        )}
      </div>

      {/* Evolution label + type badge */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          {evolutionName}
        </span>
        <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground/60">
          {typeData.emoji} {typeData.label}
        </span>
      </div>
    </div>
  )
}
