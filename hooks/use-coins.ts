"use client"

import { useState, useEffect, useCallback, useRef } from "react"

const DEFAULT_COINS = 100
const FEED_COST = 10

function getStorageKey(userId: string | null) {
  return userId ? `regenmon-coins-${userId}` : "regenmon-coins-local"
}

function loadCoins(userId: string | null): number {
  if (typeof window === "undefined") return DEFAULT_COINS
  try {
    const saved = localStorage.getItem(getStorageKey(userId))
    if (saved !== null) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return DEFAULT_COINS
}

function saveCoins(userId: string | null, coins: number) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(coins))
  } catch {
    // ignore
  }
}

/**
 * When a user logs in for the first time, migrate local coins to their
 * authenticated key so they don't lose progress.
 */
function migrateLocalCoins(userId: string) {
  if (typeof window === "undefined") return
  const authKey = getStorageKey(userId)
  if (localStorage.getItem(authKey) !== null) return // already has data
  const localKey = getStorageKey(null)
  const localData = localStorage.getItem(localKey)
  if (localData !== null) {
    localStorage.setItem(authKey, localData)
  }
}

export function useCoins(userId: string | null) {
  const [coins, setCoins] = useState(DEFAULT_COINS)
  const [mounted, setMounted] = useState(false)
  const [coinDelta, setCoinDelta] = useState<{ amount: number; id: number } | null>(null)
  const deltaCounter = useRef(0)

  useEffect(() => {
    if (userId) migrateLocalCoins(userId)
    setCoins(loadCoins(userId))
    setMounted(true)
  }, [userId])

  useEffect(() => {
    if (mounted) {
      saveCoins(userId, coins)
    }
  }, [coins, mounted, userId])

  const showDelta = useCallback((amount: number) => {
    deltaCounter.current += 1
    setCoinDelta({ amount, id: deltaCounter.current })
    setTimeout(() => setCoinDelta(null), 1500)
  }, [])

  const spendCoins = useCallback(
    (amount: number): boolean => {
      if (coins < amount) return false
      setCoins((prev) => prev - amount)
      showDelta(-amount)
      return true
    },
    [coins, showDelta]
  )

  const earnCoins = useCallback(
    (amount: number) => {
      setCoins((prev) => prev + amount)
      showDelta(amount)
    },
    [showDelta]
  )

  const canAfford = useCallback(
    (amount: number): boolean => {
      return coins >= amount
    },
    [coins]
  )

  // Probabilistic coin earning from chat -- harder as you approach 100
  const tryEarnFromChat = useCallback((): number => {
    const probability = Math.max(0.1, 1 - coins / 120)
    if (Math.random() > probability) return 0
    const amount = Math.floor(Math.random() * 4) + 2 // 2-5 coins
    earnCoins(amount)
    return amount
  }, [coins, earnCoins])

  return {
    coins: mounted ? coins : DEFAULT_COINS,
    coinDelta,
    spendCoins,
    earnCoins,
    canAfford,
    tryEarnFromChat,
    feedCost: FEED_COST,
    mounted,
  }
}
