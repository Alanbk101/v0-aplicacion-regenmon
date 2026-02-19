"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useRegenmon } from "@/hooks/use-regenmon"
import { useTraining, getStatEffects } from "@/hooks/use-training"
import type { EvaluationResult } from "@/hooks/use-training"
import { useHubSync } from "@/hooks/use-hub-sync"
import { RegenmonAvatar } from "@/components/regenmon-avatar"
import { StatBar } from "@/components/stat-bar"
import { ActionButtons } from "@/components/action-buttons"
import { RegenmonChat } from "@/components/regenmon-chat"
import { ActionHistory } from "@/components/action-history"
import { TrainingPanel } from "@/components/training-panel"
import { RegisterHub } from "@/components/register-hub"
import { Pencil, Check, RotateCcw, GraduationCap, Gamepad2, Globe } from "lucide-react"
import type { ActionEntry } from "@/hooks/use-action-history"

function getEvolutionEmoji(level: number) {
  if (level >= 20) return "\uD83D\uDC09"
  if (level >= 15) return "\uD83E\uDD8A"
  if (level >= 10) return "\uD83D\uDC3A"
  if (level >= 5) return "\uD83D\uDC23"
  return "\uD83E\uDD5A"
}

interface RegenmonCardProps {
  userId: string | null
  authenticated: boolean
  coins: number
  feedCost: number
  canAfford: (amount: number) => boolean
  spendCoins: (amount: number) => boolean
  earnCoins: (amount: number) => void
  tryEarnFromChat: () => number
  logAction: (action: string, coins: number) => void
  history: ActionEntry[]
}

export function RegenmonCard({
  userId,
  authenticated,
  coins,
  feedCost,
  canAfford,
  spendCoins,
  earnCoins,
  tryEarnFromChat,
  logAction,
  history,
}: RegenmonCardProps) {
  const {
    state,
    cooldown,
    celebrating,
    mounted,
    feed,
    play,
    train,
    setName,
    applyStatEffects,
    resetGame,
    xpPerLevel,
  } = useRegenmon(userId)

  const {
    totalPoints,
    stage,
    nextStageThreshold,
    addTrainingResult,
  } = useTraining()

  const getSyncData = useCallback(
    () => ({
      happiness: state.happiness,
      hunger: state.hunger,
      totalPoints,
    }),
    [state.happiness, state.hunger, totalPoints]
  )
  const { syncNow } = useHubSync(getSyncData)

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [showReset, setShowReset] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [activeTab, setActiveTab] = useState<"game" | "train" | "social">("game")
  const [evolutionAlert, setEvolutionAlert] = useState<string | null>(null)

  const handleEarnFromChat = useCallback(() => {
    if (!authenticated) return
    const earned = tryEarnFromChat()
    if (earned > 0) {
      logAction("Chat - Monedas ganadas", earned)
    }
  }, [authenticated, tryEarnFromChat, logAction])

  const handleFeed = useCallback(() => {
    if (authenticated) {
      const spent = spendCoins(feedCost)
      if (!spent) return
      feed()
      logAction("Alimentar", -feedCost)
    } else {
      feed()
    }
  }, [authenticated, spendCoins, feedCost, feed, logAction])

  const handlePlay = useCallback(() => {
    play()
    if (authenticated) logAction("Jugar", 0)
  }, [play, authenticated, logAction])

  const handleTrain = useCallback(() => {
    train()
    if (authenticated) logAction("Entrenar", 0)
  }, [train, authenticated, logAction])

  const startEditing = useCallback(() => {
    setNameInput(state.name)
    setEditing(true)
  }, [state.name])

  const saveName = useCallback(() => {
    const trimmed = nameInput.trim()
    if (trimmed.length > 0) {
      setName(trimmed)
    }
    setEditing(false)
  }, [nameInput, setName])

  const handleReset = useCallback(() => {
    if (showReset) {
      resetGame()
      setShowReset(false)
    } else {
      setShowReset(true)
      setTimeout(() => setShowReset(false), 3000)
    }
  }, [showReset, resetGame])

  const handleTrainingComplete = useCallback(
    (result: EvaluationResult, category: string) => {
      // Apply stat effects
      const effects = getStatEffects(result.score)
      applyStatEffects(effects)

      // Add to training history & check evolution
      const { evolved, newStage } = addTrainingResult(result.score, category)

      // Award tokens as coins
      earnCoins(result.tokens)

      if (evolved) {
        const stageNames = ["", "Bebe", "Joven", "Adulto"]
        earnCoins(100) // bonus evolution
        setEvolutionAlert(
          `${state.name} evoluciono a etapa ${newStage} (${stageNames[newStage]})! +100 tokens bonus`
        )
        setTimeout(() => setEvolutionAlert(null), 5000)
      }

      // Sync with HUB after training
      syncNow()
    },
    [applyStatEffects, addTrainingResult, earnCoins, state.name, syncNow]
  )

  // Early return AFTER all hooks have been called
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[hsl(var(--neon-cyan))] border-t-transparent rounded-full animate-spin" />
      </div>
    )
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

      {/* Tab switcher */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("game")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono font-bold transition-all",
            activeTab === "game"
              ? "text-[hsl(var(--neon-cyan))] border-b-2 border-[hsl(var(--neon-cyan))]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Gamepad2 className="w-4 h-4" />
          Juego
        </button>
        <button
          onClick={() => setActiveTab("train")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono font-bold transition-all relative",
            activeTab === "train"
              ? "text-[hsl(25_100%_55%)] border-b-2 border-[hsl(25_100%_55%)]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          Entrenar
        </button>
        <button
          onClick={() => setActiveTab("social")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono font-bold transition-all",
            activeTab === "social"
              ? "text-[hsl(var(--neon-green))] border-b-2 border-[hsl(var(--neon-green))]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className="w-4 h-4" />
          Social
        </button>
      </div>

      {/* Evolution alert */}
      {evolutionAlert && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-[hsl(var(--neon-yellow)/0.1)] border border-[hsl(50_100%_55%/0.4)] text-center">
          <p className="text-sm font-mono font-bold text-[hsl(var(--neon-yellow))]">
            {evolutionAlert}
          </p>
        </div>
      )}

      {/* Training tab */}
      {activeTab === "train" && (
        <div className="p-6">
          <TrainingPanel
            onComplete={handleTrainingComplete}
            totalPoints={totalPoints}
            stage={stage}
            nextStageThreshold={nextStageThreshold}
            onClose={() => setActiveTab("game")}
          />
        </div>
      )}

      {/* Social tab */}
      {activeTab === "social" && (
        <div className="p-6">
          <RegisterHub
            regenmonName={state.name}
            regenmonEmoji={getEvolutionEmoji(state.level)}
            stats={{ happiness: state.happiness, hunger: state.hunger }}
            totalPoints={totalPoints}
            onRegistered={syncNow}
          />
        </div>
      )}

      {/* Game tab */}
      {activeTab === "game" && <div className="p-6 flex flex-col gap-6">
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
              Nivel {state.level}
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
            icon={state.happiness >= 50 ? "\u2764\uFE0F" : "\uD83D\uDC94"}
          />
          <StatBar
            label="Hambre"
            value={state.hunger}
            max={100}
            color={state.hunger >= 70 ? "cyan" : "yellow"}
            icon={state.hunger >= 70 ? "\u26A0\uFE0F" : "\uD83C\uDF56"}
          />
          <StatBar
            label="Experiencia"
            value={state.xp}
            max={xpPerLevel}
            color="yellow"
            icon={"\u26A1"}
          />
        </div>

        {/* Action History (authenticated only) */}
        {authenticated && <ActionHistory history={history} />}

        {/* Action Buttons */}
        <ActionButtons
          onFeed={handleFeed}
          onPlay={handlePlay}
          onTrain={handleTrain}
          onChat={() => setShowChat((prev) => !prev)}
          cooldown={cooldown}
          canAffordFeed={canAfford(feedCost)}
          authenticated={authenticated}
        />

        {/* Chat panel */}
        {showChat && (
          <RegenmonChat
            regenmonState={state}
            onClose={() => setShowChat(false)}
            onEarnCoins={handleEarnFromChat}
          />
        )}

        {/* Footer tip */}
        {/* Evolution stage display */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/40 border border-border">
            <span className="text-sm">
              {stage === 1 ? "\uD83E\uDD5A" : stage === 2 ? "\uD83D\uDC23" : "\uD83D\uDC09"}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Etapa {stage}/3
            </span>
            <span className="text-[10px] font-mono text-[hsl(var(--neon-yellow))]">
              {totalPoints} pts
            </span>
          </div>
        </div>

        <p className="text-center text-[10px] font-mono text-muted-foreground tracking-wider">
          {authenticated
            ? `Alimentar cuesta ${feedCost} $FRUTA. Habla con tu Regenmon para ganar monedas.`
            : "La felicidad disminuye con el tiempo. Cuida a tu Regenmon."}
        </p>
      </div>}

      {/* Neon bottom border */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-yellow))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))]" />
    </div>
  )
}
