"use client"

import { useState, useEffect, useCallback } from "react"

export interface ActionEntry {
  action: string
  coins: number
  timestamp: number
}

const MAX_ENTRIES = 10

function getStorageKey(userId: string | null) {
  return userId ? `regenmon-history-${userId}` : null
}

function loadHistory(userId: string | null): ActionEntry[] {
  if (typeof window === "undefined" || !userId) return []
  try {
    const saved = localStorage.getItem(getStorageKey(userId)!)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return []
}

function saveHistory(userId: string | null, history: ActionEntry[]) {
  if (typeof window === "undefined" || !userId) return
  try {
    localStorage.setItem(getStorageKey(userId)!, JSON.stringify(history))
  } catch {
    // ignore
  }
}

export function useActionHistory(userId: string | null) {
  const [history, setHistory] = useState<ActionEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setHistory(loadHistory(userId))
    setMounted(true)
  }, [userId])

  useEffect(() => {
    if (mounted && userId) {
      saveHistory(userId, history)
    }
  }, [history, mounted, userId])

  const logAction = useCallback((action: string, coins: number) => {
    setHistory((prev) => {
      const entry: ActionEntry = { action, coins, timestamp: Date.now() }
      return [entry, ...prev].slice(0, MAX_ENTRIES)
    })
  }, [])

  return { history: mounted ? history : [], logAction }
}
