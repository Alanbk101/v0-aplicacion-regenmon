"use client"

import { useState, useEffect, useCallback } from "react"

export interface TrainingEntry {
  score: number
  category: string
  timestamp: number
}

export interface TrainingData {
  totalPoints: number
  stage: 1 | 2 | 3
  trainingHistory: TrainingEntry[]
}

const STORAGE_KEY = "regenmon-training"
const MAX_HISTORY = 20
const STAGE_THRESHOLDS = [0, 500, 1500] // stage 1, 2, 3

const DEFAULT_DATA: TrainingData = {
  totalPoints: 0,
  stage: 1,
  trainingHistory: [],
}

function loadData(): TrainingData {
  if (typeof window === "undefined") return DEFAULT_DATA
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...DEFAULT_DATA, ...parsed }
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_DATA }
}

function saveData(data: TrainingData) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function getStageForPoints(points: number): 1 | 2 | 3 {
  if (points >= STAGE_THRESHOLDS[2]) return 3
  if (points >= STAGE_THRESHOLDS[1]) return 2
  return 1
}

function getNextStageThreshold(stage: 1 | 2 | 3): number {
  if (stage === 1) return STAGE_THRESHOLDS[1]
  if (stage === 2) return STAGE_THRESHOLDS[2]
  return STAGE_THRESHOLDS[2] // max
}

export interface EvaluationResult {
  score: number
  feedback: string
  points: number
  tokens: number
  fallback?: boolean
}

export interface StatEffects {
  happiness: number
  energy: number
  hunger: number
}

export function getStatEffects(score: number): StatEffects {
  if (score >= 80) return { happiness: 15, energy: -20, hunger: 15 }
  if (score >= 60) return { happiness: 8, energy: -15, hunger: 12 }
  if (score >= 40) return { happiness: 3, energy: -12, hunger: 10 }
  return { happiness: -10, energy: -15, hunger: 10 }
}

export function useTraining() {
  const [data, setData] = useState<TrainingData>(DEFAULT_DATA)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setData(loadData())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) saveData(data)
  }, [data, mounted])

  const addTrainingResult = useCallback(
    (score: number, category: string): { evolved: boolean; newStage: 1 | 2 | 3 } => {
      let evolved = false
      let newStage: 1 | 2 | 3 = data.stage

      setData((prev) => {
        const newPoints = prev.totalPoints + score
        const computedStage = getStageForPoints(newPoints)
        evolved = computedStage > prev.stage
        newStage = computedStage

        const entry: TrainingEntry = {
          score,
          category,
          timestamp: Date.now(),
        }
        const newHistory = [entry, ...prev.trainingHistory].slice(0, MAX_HISTORY)

        return {
          totalPoints: newPoints,
          stage: computedStage,
          trainingHistory: newHistory,
        }
      })

      return { evolved, newStage }
    },
    [data.stage]
  )

  return {
    totalPoints: mounted ? data.totalPoints : 0,
    stage: mounted ? data.stage : 1,
    trainingHistory: mounted ? data.trainingHistory : [],
    nextStageThreshold: getNextStageThreshold(mounted ? data.stage : 1),
    addTrainingResult,
    mounted,
  }
}
