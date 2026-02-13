"use client"

import { cn } from "@/lib/utils"

interface RegenmonAvatarProps {
  level: number
  happiness: number
  celebrating: boolean
}

function getEvolutionEmoji(level: number) {
  if (level >= 20) return "🐉"
  if (level >= 15) return "🦊"
  if (level >= 10) return "🐺"
  if (level >= 5) return "🐣"
  return "🥚"
}

function getEvolutionName(level: number) {
  if (level >= 20) return "Dragenmon"
  if (level >= 15) return "Foxenmon"
  if (level >= 10) return "Wolfenmon"
  if (level >= 5) return "Chickenmon"
  return "Eggmon"
}

function getMoodEmoji(happiness: number) {
  if (happiness >= 80) return "✨"
  if (happiness >= 50) return "💫"
  if (happiness >= 25) return "💧"
  return "💔"
}

export function RegenmonAvatar({ level, happiness, celebrating }: RegenmonAvatarProps) {
  const evolutionEmoji = getEvolutionEmoji(level)
  const evolutionName = getEvolutionName(level)
  const moodEmoji = getMoodEmoji(happiness)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-40 transition-all duration-500",
            happiness >= 50
              ? "bg-[hsl(var(--neon-cyan))]"
              : "bg-[hsl(var(--neon-pink))]"
          )}
        />

        {/* Avatar container */}
        <div
          className={cn(
            "relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full",
            "border-2 transition-all duration-500",
            happiness >= 50
              ? "border-[hsl(var(--neon-cyan))] shadow-[0_0_30px_hsl(170_100%_50%/0.3)]"
              : "border-[hsl(var(--neon-pink))] shadow-[0_0_30px_hsl(330_100%_60%/0.3)]",
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

      {/* Evolution label */}
      <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
        {evolutionName}
      </span>
    </div>
  )
}
