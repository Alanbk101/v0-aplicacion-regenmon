"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  REGENMON_TYPES,
  PERSONALITIES,
  type RegenmonType,
  type RegenmonState,
  type RegenmonConfig,
} from "@/hooks/use-regenmon"
import { ArrowRight, Sparkles } from "lucide-react"

interface RegenmonCreatorProps {
  onCreate: (config: RegenmonConfig) => void
}

const typeKeys = Object.keys(REGENMON_TYPES) as RegenmonType[]
const personalityKeys = Object.keys(PERSONALITIES) as RegenmonState["personality"][]

const typeColorMap: Record<RegenmonType, { border: string; bg: string; glow: string; text: string }> = {
  fuego: {
    border: "border-[hsl(330_100%_60%/0.6)]",
    bg: "bg-[hsl(330_100%_60%/0.08)]",
    glow: "shadow-[0_0_25px_hsl(330_100%_60%/0.25)]",
    text: "text-[hsl(var(--neon-pink))]",
  },
  agua: {
    border: "border-[hsl(170_100%_50%/0.6)]",
    bg: "bg-[hsl(170_100%_50%/0.08)]",
    glow: "shadow-[0_0_25px_hsl(170_100%_50%/0.25)]",
    text: "text-[hsl(var(--neon-cyan))]",
  },
  planta: {
    border: "border-[hsl(120_70%_50%/0.6)]",
    bg: "bg-[hsl(120_70%_50%/0.08)]",
    glow: "shadow-[0_0_25px_hsl(120_70%_50%/0.25)]",
    text: "text-[hsl(var(--neon-green))]",
  },
  electrico: {
    border: "border-[hsl(50_100%_55%/0.6)]",
    bg: "bg-[hsl(50_100%_55%/0.08)]",
    glow: "shadow-[0_0_25px_hsl(50_100%_55%/0.25)]",
    text: "text-[hsl(var(--neon-yellow))]",
  },
  sombra: {
    border: "border-[hsl(280_80%_60%/0.6)]",
    bg: "bg-[hsl(280_80%_60%/0.08)]",
    glow: "shadow-[0_0_25px_hsl(280_80%_60%/0.25)]",
    text: "text-[hsl(280_80%_65%)]",
  },
  cosmico: {
    border: "border-[hsl(200_100%_60%/0.6)]",
    bg: "bg-[hsl(200_100%_60%/0.08)]",
    glow: "shadow-[0_0_25px_hsl(200_100%_60%/0.25)]",
    text: "text-[hsl(200_100%_65%)]",
  },
}

export function RegenmonCreator({ onCreate }: RegenmonCreatorProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedType, setSelectedType] = useState<RegenmonType | null>(null)
  const [selectedPersonality, setSelectedPersonality] = useState<RegenmonState["personality"] | null>(null)
  const [name, setName] = useState("")

  const canProceedStep1 = selectedType !== null
  const canProceedStep2 = selectedPersonality !== null
  const canCreate = name.trim().length > 0

  const handleCreate = () => {
    if (!selectedType || !selectedPersonality || !name.trim()) return
    onCreate({
      type: selectedType,
      baseName: name.trim(),
      personality: selectedPersonality,
    })
  }

  const activeColors = selectedType ? typeColorMap[selectedType] : null

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden border border-border bg-card"
        )}
      >
        {/* Neon top border */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-yellow))]" />

        <div className="p-6 flex flex-col gap-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (s === 1) setStep(1)
                    if (s === 2 && canProceedStep1) setStep(2)
                    if (s === 3 && canProceedStep1 && canProceedStep2) setStep(3)
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300",
                    step === s
                      ? "bg-[hsl(var(--neon-cyan))] text-[hsl(var(--primary-foreground))] shadow-[0_0_15px_hsl(170_100%_50%/0.4)]"
                      : step > s
                        ? "bg-[hsl(var(--neon-cyan)/0.2)] text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.4)]"
                        : "bg-secondary text-muted-foreground border border-border"
                  )}
                >
                  {s}
                </button>
                {s < 3 && (
                  <div
                    className={cn(
                      "w-8 h-px transition-colors",
                      step > s ? "bg-[hsl(var(--neon-cyan))]" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Choose Type */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-lg font-bold font-mono text-foreground">
                  Elige tu tipo de Regenmon
                </h2>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Cada tipo tiene habilidades y evoluciones unicas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {typeKeys.map((typeKey) => {
                  const t = REGENMON_TYPES[typeKey]
                  const colors = typeColorMap[typeKey]
                  const isSelected = selectedType === typeKey

                  return (
                    <button
                      key={typeKey}
                      onClick={() => setSelectedType(typeKey)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
                        "bg-secondary/30 hover:bg-secondary/60",
                        isSelected
                          ? [colors.border, colors.bg, colors.glow]
                          : "border-border hover:border-muted-foreground/40"
                      )}
                    >
                      <span className="text-3xl select-none">{t.emoji}</span>
                      <span className={cn("text-sm font-bold font-mono", isSelected ? colors.text : "text-foreground")}>
                        {t.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground text-center leading-tight">
                        {t.description}
                      </span>

                      {/* Evolution preview */}
                      <div className="flex items-center gap-1 mt-1">
                        {t.evolutions.map((evo, i) => (
                          <span
                            key={i}
                            className={cn(
                              "text-xs transition-opacity",
                              isSelected ? "opacity-100" : "opacity-40"
                            )}
                          >
                            {evo}
                          </span>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => canProceedStep1 && setStep(2)}
                disabled={!canProceedStep1}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-3 rounded-xl font-mono font-bold text-sm transition-all duration-300",
                  canProceedStep1
                    ? "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.4)] hover:shadow-[0_0_20px_hsl(170_100%_50%/0.3)]"
                    : "bg-secondary text-muted-foreground border border-border cursor-not-allowed"
                )}
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Choose Personality */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-lg font-bold font-mono text-foreground">
                  Elige su personalidad
                </h2>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  La personalidad afecta como crece tu Regenmon
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {personalityKeys.map((pKey) => {
                  const p = PERSONALITIES[pKey]
                  const isSelected = selectedPersonality === pKey

                  return (
                    <button
                      key={pKey}
                      onClick={() => setSelectedPersonality(pKey)}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
                        "bg-secondary/30 hover:bg-secondary/60",
                        isSelected && activeColors
                          ? [activeColors.border, activeColors.bg, activeColors.glow]
                          : "border-border hover:border-muted-foreground/40"
                      )}
                    >
                      <span className="text-2xl select-none">{p.emoji}</span>
                      <span
                        className={cn(
                          "text-sm font-bold font-mono",
                          isSelected && activeColors ? activeColors.text : "text-foreground"
                        )}
                      >
                        {p.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground text-center leading-tight">
                        {p.description}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-mono font-bold text-sm bg-secondary text-muted-foreground border border-border hover:text-foreground transition-all"
                >
                  Atras
                </button>
                <button
                  onClick={() => canProceedStep2 && setStep(3)}
                  disabled={!canProceedStep2}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono font-bold text-sm transition-all duration-300",
                    canProceedStep2
                      ? "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.4)] hover:shadow-[0_0_20px_hsl(170_100%_50%/0.3)]"
                      : "bg-secondary text-muted-foreground border border-border cursor-not-allowed"
                  )}
                >
                  Siguiente <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Name and Confirm */}
          {step === 3 && selectedType && selectedPersonality && (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <h2 className="text-lg font-bold font-mono text-foreground">
                  Dale un nombre
                </h2>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  Bautiza a tu nuevo companero
                </p>
              </div>

              {/* Preview */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "relative flex items-center justify-center w-28 h-28 rounded-full border-2 animate-float",
                    activeColors?.border,
                    activeColors?.glow
                  )}
                  style={{
                    background: "radial-gradient(circle at 30% 30%, hsl(240 20% 16%), hsl(240 20% 6%))",
                  }}
                >
                  <span className="text-5xl select-none">
                    {REGENMON_TYPES[selectedType].evolutions[0]}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    {REGENMON_TYPES[selectedType].label}
                  </span>
                  <span className="text-muted-foreground">{"/"}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {PERSONALITIES[selectedPersonality].emoji} {PERSONALITIES[selectedPersonality].label}
                  </span>
                </div>

                {/* Evolution line preview */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/40 border border-border">
                  {REGENMON_TYPES[selectedType].evolutions.map((evo, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{evo}</span>
                        <span className="text-[8px] font-mono text-muted-foreground max-w-[60px] text-center leading-tight">
                          {REGENMON_TYPES[selectedType].evolutionNames[i]}
                        </span>
                      </div>
                      {i < REGENMON_TYPES[selectedType].evolutions.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="regenmon-name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Nombre
                </label>
                <input
                  id="regenmon-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canCreate && handleCreate()}
                  maxLength={20}
                  placeholder={REGENMON_TYPES[selectedType].evolutionNames[0]}
                  autoFocus
                  className={cn(
                    "w-full px-4 py-3 rounded-xl bg-secondary/50 border font-mono text-foreground text-center",
                    "outline-none transition-all duration-300 placeholder:text-muted-foreground/40",
                    "focus:border-[hsl(var(--neon-cyan))] focus:shadow-[0_0_15px_hsl(170_100%_50%/0.2)]",
                    "border-border"
                  )}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-mono font-bold text-sm bg-secondary text-muted-foreground border border-border hover:text-foreground transition-all"
                >
                  Atras
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!canCreate}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono font-bold text-sm transition-all duration-300",
                    canCreate
                      ? "bg-[hsl(var(--neon-cyan)/0.2)] text-[hsl(var(--neon-cyan))] border border-[hsl(170_100%_50%/0.5)] hover:shadow-[0_0_25px_hsl(170_100%_50%/0.4)] hover:bg-[hsl(var(--neon-cyan)/0.3)]"
                      : "bg-secondary text-muted-foreground border border-border cursor-not-allowed"
                  )}
                >
                  <Sparkles className="w-4 h-4" /> Crear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Neon bottom border */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[hsl(var(--neon-yellow))] via-[hsl(var(--neon-pink))] to-[hsl(var(--neon-cyan))]" />
      </div>
    </div>
  )
}
