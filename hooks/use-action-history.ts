"use client"

import { useState, useEffect, useCallback } from "react"

export interface ActionEntry {
  action: string
  coins: number
  timestamp: number
}

const MAX_ENTRIES = 10

function getStorageKey(userId: string | null) {
  return userId ? `regenmon-history-${userId}` : "regenmon-history-local"
}

function loadHistory(userId: string | null): ActionEntry[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(getStorageKey(userId))
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return []
}

function saveHistory(userId: string | null, history: ActionEntry[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(history))
  } catch {
    // ignore
  }
}

function migrateLocalHistory(userId: string) {
  if (typeof window === "undefined") return
  const authKey = getStorageKey(userId)
  if (localStorage.getItem(authKey) !== null) return
  const localKey = getStorageKey(null)
  const localData = localStorage.getItem(localKey)
  if (localData !== null) {
    localStorage.setItem(authKey, localData)
  }
}

export function useActionHistory(userId: string | null) {
  const [history, setHistory] = useState<ActionEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (userId) migrateLocalHistory(userId)
    setHistory(loadHistory(userId))
    setMounted(true)
  }, [userId])

  useEffect(() => {
    if (mounted) {
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
