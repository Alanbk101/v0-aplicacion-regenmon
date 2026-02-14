"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useRegenmon } from "@/hooks/use-regenmon"
import { RegenmonAvatar } from "@/components/regenmon-avatar"
import { StatBar } from "@/components/stat-bar"
import { ActionButtons } from "@/components/action-buttons"
import { RegenmonChat } from "@/components/regenmon-chat"
import { Pencil, Check, RotateCcw } from "lucide-react"

export function RegenmonCard() {
  const {
    state,
    cooldown,
    celebrating,
    mounted,
    feed,
    play,
    train,
    setName,
    resetGame,
    xpPerLevel,
  } = useRegenmon()

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [showReset, setShowReset] = useState(false)
  const [showChat, setShowChat] = useState(false)

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[hsl(var(--neon-cyan))] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const startEditing = () => {
    setNameInput(state.name)
    setEditing(true)
  }

  const saveName = () => {
    const trimmed = nameInput.trim()
    if (trimmed.length > 0) {
      setName(trimmed)
    }
    setEditing(false)
  }

  const handleReset = () => {
    if (showReset) {
      resetGame()
      setShowReset(false)
    } else {
      setShowReset(true)
      setTimeout(() => setShowReset(false), 3000)
    }
  }

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto rounded-2xl overflow-hidden",
        "border border-border",
        "bg-card",
        celebrating && "shadow-[0_0_60px_hsl(170_100%_50%/0.2)]"
      )}
    >
      {/* Neon top border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-yellow))]" />

      <div className="p-6 flex flex-col gap-6">
        {/* Level badge + Reset */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold",
                "bg-[hsl(var(--neon-cyan)/0.1)] text-[hsl(var(--neon-cyan))]",
                "border border-[hsl(170_100%_50%/0.3)]"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--neon-cyan))] animate-pulse" />
              NVL {state.level}
            </span>
          </div>

          <button
            onClick={handleReset}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-mono transition-all",
              showReset
                ? "bg-destructive/20 text-destructive border border-destructive/40"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Reiniciar juego"
          >
            <RotateCcw className="w-3 h-3" />
            {showReset ? "Confirmar" : ""}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <RegenmonAvatar
            level={state.level}
            happiness={state.happiness}
            celebrating={celebrating}
          />
        </div>

        {/* Editable Name */}
        <div className="flex items-center justify-center gap-2">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                maxLength={20}
                autoFocus
                className={cn(
                  "bg-transparent border-b-2 border-[hsl(var(--neon-cyan))] text-center",
                  "text-lg font-bold text-foreground outline-none",
                  "font-mono px-2 py-0.5"
                )}
              />
              <button
                onClick={saveName}
                className="text-[hsl(var(--neon-cyan))] hover:text-[hsl(var(--neon-green))] transition-colors"
                aria-label="Guardar nombre"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="group flex items-center gap-2 text-lg font-bold font-mono text-foreground hover:text-[hsl(var(--neon-cyan))] transition-colors"
              aria-label="Editar nombre"
            >
              {state.name}
              <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Level Up Banner */}
        {celebrating && (
          <div className="flex justify-center">
            <span
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-mono font-bold",
                "bg-[hsl(var(--neon-yellow)/0.15)] text-[hsl(var(--neon-yellow))]",
                "border border-[hsl(50_100%_55%/0.4)]",
                "shadow-[0_0_20px_hsl(50_100%_55%/0.3)]",
                "animate-celebrate"
              )}
            >
              {"🎉"} Nivel {state.level} {"🎉"}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-col gap-4">
          <StatBar
            label="Felicidad"
            value={state.happiness}
            max={100}
            color={state.happiness >= 50 ? "pink" : "cyan"}
            icon={state.happiness >= 50 ? "❤️" : "💔"}
          />
          <StatBar
            label="Experiencia"
            value={state.xp}
            max={xpPerLevel}
            color="yellow"
            icon="⚡"
          />
        </div>

        {/* Action Buttons */}
        <ActionButtons
          onFeed={feed}
          onPlay={play}
          onTrain={train}
          onChat={() => setShowChat((prev) => !prev)}
          cooldown={cooldown}
        />

        {/* Chat panel */}
        {showChat && (
          <RegenmonChat
            regenmonState={state}
            onClose={() => setShowChat(false)}
          />
        )}

        {/* Footer tip */}
        <p className="text-center text-[10px] font-mono text-muted-foreground tracking-wider">
          La felicidad disminuye con el tiempo. Cuida a tu Regenmon.
        </p>
      </div>

      {/* Neon bottom border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-yellow))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))]" />
    </div>
  )
}
