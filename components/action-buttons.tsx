"use client"

import { cn } from "@/lib/utils"
import { UtensilsCrossed, Gamepad2, Dumbbell, MessageCircle } from "lucide-react"

interface ActionButtonsProps {
  onFeed: () => void
  onPlay: () => void
  onTrain: () => void
  onChat: () => void
  cooldown: boolean
}

interface ActionConfig {
  label: string
  detail: string
  icon: React.ReactNode
  onClick: () => void
  colorClass: string
  glowClass: string
  borderClass: string
  ignoresCooldown?: boolean
}

export function ActionButtons({ onFeed, onPlay, onTrain, onChat, cooldown }: ActionButtonsProps) {
  const actions: ActionConfig[] = [
    {
      label: "Alimentar",
      detail: "+20 Felicidad, +5 XP",
      icon: <UtensilsCrossed className="w-5 h-5" />,
      onClick: onFeed,
      colorClass: "text-[hsl(var(--neon-cyan))]",
      glowClass: "hover:shadow-[0_0_25px_hsl(170_100%_50%/0.3)] active:shadow-[0_0_35px_hsl(170_100%_50%/0.5)]",
      borderClass: "border-[hsl(170_100%_50%/0.3)] hover:border-[hsl(var(--neon-cyan))]",
    },
    {
      label: "Jugar",
      detail: "+15 Felicidad, +10 XP",
      icon: <Gamepad2 className="w-5 h-5" />,
      onClick: onPlay,
      colorClass: "text-[hsl(var(--neon-pink))]",
      glowClass: "hover:shadow-[0_0_25px_hsl(330_100%_60%/0.3)] active:shadow-[0_0_35px_hsl(330_100%_60%/0.5)]",
      borderClass: "border-[hsl(330_100%_60%/0.3)] hover:border-[hsl(var(--neon-pink))]",
    },
    {
      label: "Entrenar",
      detail: "+5 Felicidad, +20 XP",
      icon: <Dumbbell className="w-5 h-5" />,
      onClick: onTrain,
      colorClass: "text-[hsl(var(--neon-yellow))]",
      glowClass: "hover:shadow-[0_0_25px_hsl(50_100%_55%/0.3)] active:shadow-[0_0_35px_hsl(50_100%_55%/0.5)]",
      borderClass: "border-[hsl(50_100%_55%/0.3)] hover:border-[hsl(var(--neon-yellow))]",
    },
    {
      label: "Hablar",
      detail: "Chat con IA",
      icon: <MessageCircle className="w-5 h-5" />,
      onClick: onChat,
      colorClass: "text-[hsl(var(--neon-green))]",
      glowClass: "hover:shadow-[0_0_25px_hsl(120_70%_50%/0.3)] active:shadow-[0_0_35px_hsl(120_70%_50%/0.5)]",
      borderClass: "border-[hsl(120_70%_50%/0.3)] hover:border-[hsl(var(--neon-green))]",
      ignoresCooldown: true,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const isDisabled = cooldown && !action.ignoresCooldown
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={isDisabled}
            className={cn(
              "group relative flex flex-col items-center gap-2 p-4 rounded-xl",
              "bg-secondary/50 border transition-all duration-300",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none",
              action.borderClass,
              action.glowClass
            )}
          >
            <div className={cn("transition-transform duration-200 group-hover:scale-110 group-active:scale-95", action.colorClass)}>
              {action.icon}
            </div>
            <span className={cn("text-sm font-semibold", action.colorClass)}>
              {action.label}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground leading-tight text-center">
              {action.detail}
            </span>

            {/* Cooldown overlay */}
            {isDisabled && (
              <div className="absolute inset-0 rounded-xl bg-background/60 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
