"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export type RegenmonType = "fuego" | "agua" | "planta" | "electrico" | "sombra" | "cosmico"

export interface RegenmonConfig {
  type: RegenmonType
  baseName: string
  personality: "valiente" | "tranquilo" | "travieso" | "misterioso"
}

export interface RegenmonState {
  name: string
  level: number
  happiness: number
  xp: number
  createdAt: number
  type: RegenmonType
  personality: "valiente" | "tranquilo" | "travieso" | "misterioso"
}

export const REGENMON_TYPES: Record<
  RegenmonType,
  {
    label: string
    emoji: string
    evolutions: string[]
    evolutionNames: string[]
    color: "cyan" | "pink" | "yellow" | "green"
    neonVar: string
    description: string
  }
> = {
  fuego: {
    label: "Fuego",
    emoji: "🔥",
    evolutions: ["🥚", "🐣", "🦎", "🐲", "🐉"],
    evolutionNames: ["Huevo Igneo", "Chisparion", "Flamarion", "Dracoflame", "Infernarion"],
    color: "pink",
    neonVar: "--neon-pink",
    description: "Ardiente y poderoso. Gana XP extra al Entrenar.",
  },
  agua: {
    label: "Agua",
    emoji: "💧",
    evolutions: ["🥚", "🐟", "🐬", "🦈", "🐋"],
    evolutionNames: ["Huevo Marino", "Gotarion", "Delfinmon", "Tiburonex", "Leviatanmon"],
    color: "cyan",
    neonVar: "--neon-cyan",
    description: "Calmado y adaptable. Gana Felicidad extra al Jugar.",
  },
  planta: {
    label: "Planta",
    emoji: "🌿",
    evolutions: ["🥚", "🌱", "🌿", "🌳", "🌲"],
    evolutionNames: ["Huevo Verde", "Brotemon", "Herbamon", "Arborex", "Forestiamon"],
    color: "green",
    neonVar: "--neon-green",
    description: "Resistente y sanador. Gana Felicidad extra al Alimentar.",
  },
  electrico: {
    label: "Electrico",
    emoji: "⚡",
    evolutions: ["🥚", "✨", "⚡", "🌩️", "💫"],
    evolutionNames: ["Huevo Voltio", "Chisparex", "Raiomon", "Tormentex", "Novarion"],
    color: "yellow",
    neonVar: "--neon-yellow",
    description: "Rapido y energetico. Cooldown reducido en acciones.",
  },
  sombra: {
    label: "Sombra",
    emoji: "🌑",
    evolutions: ["🥚", "👁️", "🦇", "🐺", "🐲"],
    evolutionNames: ["Huevo Oscuro", "Umbrion", "Nocturnex", "Sombramon", "Abyssarion"],
    color: "pink",
    neonVar: "--neon-pink",
    description: "Misterioso y fuerte. XP extra en todas las acciones.",
  },
  cosmico: {
    label: "Cosmico",
    emoji: "🌌",
    evolutions: ["🥚", "⭐", "🌟", "💎", "🔮"],
    evolutionNames: ["Huevo Estelar", "Starmon", "Cosmion", "Cristalarion", "Nebulanex"],
    color: "cyan",
    neonVar: "--neon-cyan",
    description: "Raro y equilibrado. Bonificacion en todas las estadisticas.",
  },
}

export const PERSONALITIES: Record<
  RegenmonState["personality"],
  { label: string; emoji: string; description: string }
> = {
  valiente: { label: "Valiente", emoji: "🛡️", description: "Mas XP al Entrenar" },
  tranquilo: { label: "Tranquilo", emoji: "😌", description: "Felicidad decae mas lento" },
  travieso: { label: "Travieso", emoji: "😈", description: "Mas XP al Jugar" },
  misterioso: { label: "Misterioso", emoji: "🔮", description: "Bonificacion aleatoria" },
}

const STORAGE_KEY = "regenmon-save"
const XP_PER_LEVEL = 100
const HAPPINESS_DECAY_INTERVAL = 10000
const COOLDOWN_MS = 3000

function getDefaultState(): RegenmonState {
  return {
    name: "Regenmon",
    level: 1,
    happiness: 100,
    xp: 0,
    createdAt: Date.now(),
    type: "fuego",
    personality: "valiente",
  }
}

function loadState(): RegenmonState | null {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.type) {
        return { ...getDefaultState(), ...parsed }
      }
    }
  } catch {
    // ignore
  }
  return null
}

function saveState(state: RegenmonState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function clearSave() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function useRegenmon() {
  const [state, setState] = useState<RegenmonState | null>(null)
  const [cooldown, setCooldown] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const saved = loadState()
    setState(saved)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && state) {
      saveState(state)
    }
  }, [state, mounted])

  // Happiness decay - personality affects rate
  useEffect(() => {
    if (!mounted || !state) return
    const decayRate = state.personality === "tranquilo" ? HAPPINESS_DECAY_INTERVAL * 2 : HAPPINESS_DECAY_INTERVAL
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev) return prev
        return { ...prev, happiness: Math.max(0, prev.happiness - 1) }
      })
    }, decayRate)
    return () => clearInterval(interval)
  }, [mounted, state?.personality, state !== null])

  const startCooldown = useCallback(() => {
    const cdMs = state?.type === "electrico" ? COOLDOWN_MS * 0.6 : COOLDOWN_MS
    setCooldown(true)
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    cooldownTimer.current = setTimeout(() => setCooldown(false), cdMs)
  }, [state?.type])

  const triggerLevelUp = useCallback(() => {
    setCelebrating(true)
    setTimeout(() => setCelebrating(false), 1200)
  }, [])

  const performAction = useCallback(
    (happinessGain: number, xpGain: number) => {
      if (cooldown || !state) return
      startCooldown()

      setState((prev) => {
        if (!prev) return prev

        let hGain = happinessGain
        let xGain = xpGain

        // Type bonuses
        if (prev.type === "cosmico") {
          hGain = Math.round(hGain * 1.1)
          xGain = Math.round(xGain * 1.1)
        }
        if (prev.type === "sombra") {
          xGain = Math.round(xGain * 1.15)
        }

        // Personality bonuses
        if (prev.personality === "misterioso") {
          const bonus = Math.random() > 0.5
          if (bonus) {
            hGain += 5
            xGain += 5
          }
        }

        const newHappiness = Math.min(100, prev.happiness + hGain)
        let newXp = prev.xp + xGain
        let newLevel = prev.level

        if (newXp >= XP_PER_LEVEL) {
          newXp = newXp - XP_PER_LEVEL
          newLevel = prev.level + 1
          setTimeout(() => triggerLevelUp(), 100)
        }

        return { ...prev, happiness: newHappiness, xp: newXp, level: newLevel }
      })
    },
    [cooldown, state, startCooldown, triggerLevelUp]
  )

  const feed = useCallback(() => {
    const hBonus = state?.type === "planta" ? 30 : 20
    performAction(hBonus, 5)
  }, [performAction, state?.type])

  const play = useCallback(() => {
    const hBonus = state?.type === "agua" ? 22 : 15
    const xBonus = state?.personality === "travieso" ? 15 : 10
    performAction(hBonus, xBonus)
  }, [performAction, state?.type, state?.personality])

  const train = useCallback(() => {
    const xBonus = state?.type === "fuego" ? 28 : state?.personality === "valiente" ? 25 : 20
    performAction(5, xBonus)
  }, [performAction, state?.type, state?.personality])

  const setName = useCallback((name: string) => {
    setState((prev) => (prev ? { ...prev, name } : prev))
  }, [])

  const createRegenmon = useCallback((config: RegenmonConfig) => {
    const newState: RegenmonState = {
      name: config.baseName,
      level: 1,
      happiness: 100,
      xp: 0,
      createdAt: Date.now(),
      type: config.type,
      personality: config.personality,
    }
    setState(newState)
    saveState(newState)
  }, [])

  const chatMessage = useCallback(
    (consecutiveCount: number) => {
      setState((prev) => {
        if (!prev) return prev
        const energyCost = consecutiveCount > 5 ? 8 : 3
        const happinessGain = 5
        return {
          ...prev,
          happiness: Math.min(100, Math.max(0, prev.happiness + happinessGain - energyCost)),
        }
      })
    },
    []
  )

  const resetGame = useCallback(() => {
    clearSave()
    localStorage.removeItem("regenmon-chat")
    localStorage.removeItem("regenmon-memories")
    setState(null)
  }, [])

  return {
    state,
    cooldown,
    celebrating,
    mounted,
    feed,
    play,
    train,
    setName,
    resetGame,
    createRegenmon,
    chatMessage,
    xpPerLevel: XP_PER_LEVEL,
    hasRegenmon: state !== null,
  }
}
