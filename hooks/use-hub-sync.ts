"use client"

import { useEffect, useRef, useCallback } from "react"
import { syncWithHub, getHubId, isRegistered, setHubBalance } from "@/hooks/use-hub"

const SYNC_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

interface SyncData {
  happiness: number
  hunger: number
  totalPoints: number
}

export function useHubSync(getData: () => SyncData) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const doSync = useCallback(async () => {
    const hubId = getHubId()
    if (!hubId || !isRegistered()) return

    const { happiness, hunger, totalPoints } = getData()

    try {
      const res = await syncWithHub({
        regenmonId: hubId,
        stats: { happiness, energy: 100, hunger },
        totalPoints,
        trainingHistory: [],
      })
      if (res.data?.balance != null) {
        setHubBalance(res.data.balance)
      }
    } catch {
      // Silent fail — hub might be resting
    }
  }, [getData])

  useEffect(() => {
    if (!isRegistered()) return

    // Sync immediately on mount
    doSync()

    intervalRef.current = setInterval(doSync, SYNC_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [doSync])

  return { syncNow: doSync }
}
