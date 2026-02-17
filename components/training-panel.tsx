"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Upload, X, Loader2, RotateCcw, Code, Palette, Rocket, BookOpen } from "lucide-react"
import type { EvaluationResult, StatEffects } from "@/hooks/use-training"
import { getStatEffects } from "@/hooks/use-training"

type Category = "codigo" | "diseno" | "proyecto" | "aprendizaje"

interface CategoryOption {
  id: Category
  label: string
  icon: React.ReactNode
  description: string
}

const CATEGORIES: CategoryOption[] = [
  { id: "codigo", label: "Codigo", icon: <Code className="w-5 h-5" />, description: "Tu mejor codigo" },
  { id: "diseno", label: "Diseno", icon: <Palette className="w-5 h-5" />, description: "UI/UX o grafico" },
  { id: "proyecto", label: "Proyecto", icon: <Rocket className="w-5 h-5" />, description: "Proyecto completo" },
  { id: "aprendizaje", label: "Aprendizaje", icon: <BookOpen className="w-5 h-5" />, description: "Notas o ejercicios" },
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface TrainingPanelProps {
  onComplete: (result: EvaluationResult, category: Category) => void
  totalPoints: number
  stage: 1 | 2 | 3
  nextStageThreshold: number
  onClose: () => void
}

function getScoreEmoji(score: number) {
  if (score >= 80) return "trophy"
  if (score >= 60) return "star"
  if (score >= 40) return "thumbs"
  return "muscle"
}

function getScoreBgClass(score: number) {
  if (score >= 80) return "bg-[hsl(25_100%_50%/0.1)] border-[hsl(25_100%_50%/0.3)]"
  if (score >= 60) return "bg-[hsl(var(--neon-yellow)/0.1)] border-[hsl(50_100%_55%/0.3)]"
  if (score >= 40) return "bg-[hsl(var(--neon-yellow)/0.1)] border-[hsl(50_100%_55%/0.3)]"
  return "bg-[hsl(0_80%_55%/0.1)] border-[hsl(0_80%_55%/0.3)]"
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excelente"
  if (score >= 60) return "Buen trabajo"
  if (score >= 40) return "Aceptable"
  return "Sigue intentando"
}

export function TrainingPanel({
  onComplete,
  totalPoints,
  stage,
  nextStageThreshold,
  onClose,
}: TrainingPanelProps) {
  const [category, setCategory] = useState<Category | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (file.size > MAX_FILE_SIZE) {
      setError("La imagen es demasiado grande. Maximo 5MB.")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imagenes (PNG, JPG, etc.).")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImagePreview(dataUrl)
      setImageBase64(dataUrl)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleCancel = useCallback(() => {
    setImagePreview(null)
    setImageBase64(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const handleEvaluate = useCallback(async () => {
    if (!imageBase64 || !category) return
    setEvaluating(true)
    setError(null)

    try {
      const res = await fetch("/api/demo/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, category }),
      })

      if (!res.ok) throw new Error("Error en la evaluacion")

      const data: EvaluationResult = await res.json()
      setResult(data)
      onComplete(data, category)
    } catch {
      const fallbackScore = Math.floor(Math.random() * 21) + 40
      const fallbackResult: EvaluationResult = {
        score: fallbackScore,
        feedback: "Sistema de evaluacion temporalmente no disponible. Score por defecto asignado.",
        points: fallbackScore,
        tokens: Math.floor(fallbackScore * 0.5),
        fallback: true,
      }
      setResult(fallbackResult)
      onComplete(fallbackResult, category)
    } finally {
      setEvaluating(false)
    }
  }, [imageBase64, category, onComplete])

  const handleTrainAgain = useCallback(() => {
    setCategory(null)
    setImagePreview(null)
    setImageBase64(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  // -- RESULTS VIEW --
  if (result) {
    const scoreIcon = getScoreEmoji(result.score)
    const scoreBg = getScoreBgClass(result.score)
    const effects = getStatEffects(result.score)

    return (
      <div className="flex flex-col gap-4">
        {/* Score card */}
        <div className={cn("flex flex-col items-center gap-2 p-4 rounded-xl border", scoreBg)}>
          <span className="text-2xl" role="img" aria-label={scoreIcon}>
            {result.score >= 80 ? "\uD83C\uDFC6" : result.score >= 60 ? "\u2B50" : result.score >= 40 ? "\uD83D\uDC4D" : "\uD83D\uDCAA"}
          </span>
          <span className="text-3xl font-mono font-bold text-foreground">
            {result.score}/100
          </span>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {getScoreLabel(result.score)}
          </span>
        </div>

        {/* Feedback */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-sm font-mono text-foreground leading-relaxed">{result.feedback}</p>
          {result.fallback && (
            <p className="mt-2 text-[10px] font-mono text-[hsl(var(--neon-yellow))]">
              Score por defecto asignado por indisponibilidad temporal.
            </p>
          )}
        </div>

        {/* Rewards */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-[hsl(var(--neon-yellow)/0.08)] border border-[hsl(50_100%_55%/0.2)]">
            <span className="text-lg">{"\u2B50"}</span>
            <span className="text-sm font-mono font-bold text-[hsl(var(--neon-yellow))]">
              +{result.points} Puntos
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-[hsl(0_80%_50%/0.08)] border border-[hsl(0_80%_50%/0.2)]">
            <span className="text-lg">{"\uD83C\uDF4E"}</span>
            <span className="text-sm font-mono font-bold text-[hsl(var(--neon-pink))]">
              +{result.tokens} $FRUTA
            </span>
          </div>
        </div>

        {/* Stat effects */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Efectos en stats</span>
          <div className="grid grid-cols-3 gap-2">
            <StatEffect label="Felicidad" value={effects.happiness} />
            <StatEffect label="Energia" value={effects.energy} />
            <StatEffect label="Hambre" value={effects.hunger} />
          </div>
        </div>

        {/* Progress */}
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>Total: {totalPoints} pts</span>
            <span>Etapa {stage}/3</span>
            <span>
              {stage < 3
                ? `Proxima: ${nextStageThreshold} pts`
                : "Etapa maxima"}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-[hsl(var(--neon-cyan))] transition-all duration-700"
              style={{
                width: `${Math.min(100, (totalPoints / nextStageThreshold) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Train again button */}
        <button
          onClick={handleTrainAgain}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-3 rounded-xl",
            "font-mono font-bold text-sm",
            "bg-[hsl(var(--neon-cyan)/0.1)] text-[hsl(var(--neon-cyan))]",
            "border border-[hsl(170_100%_50%/0.3)] hover:border-[hsl(var(--neon-cyan))]",
            "hover:shadow-[0_0_20px_hsl(170_100%_50%/0.2)] transition-all"
          )}
        >
          <RotateCcw className="w-4 h-4" />
          Entrenar Nuevamente
        </button>
      </div>
    )
  }

  // -- UPLOAD + EVALUATE VIEW --
  return (
    <div className="flex flex-col gap-4">
      {/* Category selection */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Elige una categoria
        </span>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all font-mono",
                category === cat.id
                  ? "bg-[hsl(25_100%_50%/0.12)] border-[hsl(25_100%_50%/0.5)] text-[hsl(25_100%_55%)] shadow-[0_0_15px_hsl(25_100%_50%/0.15)]"
                  : "bg-secondary/30 border-border text-muted-foreground hover:border-[hsl(25_100%_50%/0.3)] hover:text-foreground"
              )}
            >
              {cat.icon}
              <span className="text-xs font-bold">{cat.label}</span>
              <span className="text-[9px] opacity-70">{cat.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload area */}
      {category && !imagePreview && (
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl",
              "border-2 border-dashed border-[hsl(25_100%_50%/0.3)]",
              "text-muted-foreground hover:text-foreground hover:border-[hsl(25_100%_50%/0.6)]",
              "transition-all font-mono"
            )}
          >
            <Upload className="w-8 h-8" />
            <span className="text-sm font-bold">Subir Captura</span>
            <span className="text-[10px]">PNG, JPG - Max 5MB</span>
          </button>
        </div>
      )}

      {/* Image preview */}
      {imagePreview && (
        <div className="flex flex-col gap-3">
          <div
            className="relative w-full h-[200px] rounded-xl overflow-hidden border-2 border-[hsl(25_100%_50%/0.4)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview de tu trabajo"
              className="w-full h-full object-contain bg-secondary/30"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl",
                "font-mono font-bold text-sm transition-all",
                "bg-[hsl(var(--neon-cyan)/0.15)] text-[hsl(var(--neon-cyan))]",
                "border border-[hsl(170_100%_50%/0.4)] hover:border-[hsl(var(--neon-cyan))]",
                "hover:shadow-[0_0_20px_hsl(170_100%_50%/0.2)]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {evaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evaluando...
                </>
              ) : (
                "Evaluar"
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={evaluating}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                "font-mono font-bold text-sm",
                "text-muted-foreground border border-border hover:border-destructive/40 hover:text-destructive",
                "transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-xs font-mono text-destructive">{error}</p>
        </div>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors text-center"
      >
        Volver al juego
      </button>
    </div>
  )
}

function StatEffect({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0
  return (
    <div
      className={cn(
        "flex flex-col items-center p-2 rounded-lg border text-center",
        isPositive
          ? "bg-[hsl(var(--neon-green)/0.05)] border-[hsl(120_70%_50%/0.2)]"
          : "bg-[hsl(0_80%_55%/0.05)] border-[hsl(0_80%_55%/0.2)]"
      )}
    >
      <span className="text-[10px] font-mono text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-xs font-mono font-bold",
          isPositive ? "text-[hsl(var(--neon-green))]" : "text-destructive"
        )}
      >
        {isPositive ? "+" : ""}{value}
      </span>
    </div>
  )
}
