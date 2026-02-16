"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export interface RegenmonState {
  name: string
  level: number
  happiness: number
  hunger: number
  xp: number
  createdAt: number
}

const STORAGE_KEY_PREFIX = "regenmon-save"
const XP_PER_LEVEL = 100
const HAPPINESS_DECAY_INTERVAL = 10000 // 10 seconds
const HUNGER_DECAY_INTERVAL = 15000 // 15 seconds
const COOLDOWN_MS = 3000

const DEFAULT_STATE: RegenmonState = {
  name: "Regenmon",
  level: 1,
  happiness: 100,
  hunger: 50,
  xp: 0,
  createdAt: Date.now(),
}

function getStorageKey(userId: string | null) {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX
}

function loadState(userId: string | null): RegenmonState {
  if (typeof window === "undefined") return DEFAULT_STATE
  try {
    const saved = localStorage.getItem(getStorageKey(userId))
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_STATE, ...parsed }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_STATE, createdAt: Date.now() }
}

function saveState(userId: string | null, state: RegenmonState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function useRegenmon(userId: string | null = null) {
  const [state, setState] = useState<RegenmonState>(DEFAULT_STATE)
  const [cooldown, setCooldown] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage on mount or userId change
  useEffect(() => {
    setState(loadState(userId))
    setMounted(true)
  }, [userId])

  // Save to localStorage on state change
  useEffect(() => {
    if (mounted) {
      saveState(userId, state)
    }
  }, [state, mounted, userId])

  // Happiness decay
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        happiness: Math.max(0, prev.happiness - 1),
      }))
    }, HAPPINESS_DECAY_INTERVAL)
    return () => clearInterval(interval)
  }, [mounted])

  // Hunger decay (hunger increases over time = more hungry)
  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        hunger: Math.min(100, prev.hunger + 2),
      }))
    }, HUNGER_DECAY_INTERVAL)
    return () => clearInterval(interval)
  }, [mounted])

  const startCooldown = useCallback(() => {
    setCooldown(true)
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    cooldownTimer.current = setTimeout(() => setCooldown(false), COOLDOWN_MS)
  }, [])

  const triggerLevelUp = useCallback(() => {
    setCelebrating(true)
    setTimeout(() => setCelebrating(false), 1200)
  }, [])

  const performAction = useCallback(
    (happinessGain: number, xpGain: number, hungerChange: number = 0) => {
      if (cooldown) return
      startCooldown()

      setState((prev) => {
        const newHappiness = Math.min(100, prev.happiness + happinessGain)
        const newHunger = Math.max(0, Math.min(100, prev.hunger + hungerChange))
        let newXp = prev.xp + xpGain
        let newLevel = prev.level

        if (newXp >= XP_PER_LEVEL) {
          newXp = newXp - XP_PER_LEVEL
          newLevel = prev.level + 1
          setTimeout(() => triggerLevelUp(), 100)
        }

        return {
          ...prev,
          happiness: newHappiness,
          hunger: newHunger,
          xp: newXp,
          level: newLevel,
        }
      })
    },
    [cooldown, startCooldown, triggerLevelUp]
  )

  // Feed now reduces hunger and returns true (success tracked by caller for coins)
  const feed = useCallback((): boolean => {
    if (cooldown) return false
    performAction(20, 5, -30)
    return true
  }, [cooldown, performAction])

  const play = useCallback(() => performAction(15, 10, 5), [performAction])
  const train = useCallback(() => performAction(5, 20, 10), [performAction])

  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }))
  }, [])

  const resetGame = useCallback(() => {
    const fresh = { ...DEFAULT_STATE, createdAt: Date.now() }
    setState(fresh)
    saveState(userId, fresh)
  }, [userId])

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
    xpPerLevel: XP_PER_LEVEL,
  }
}
