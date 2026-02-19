"use client"

const HUB_BASE = "https://regenmon-final.vercel.app/api"

async function hubFetch<T>(
  path: string,
  options?: RequestInit,
  retries = 1
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${HUB_BASE}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...options?.headers },
      })
      if (!res.ok) {
        const errorBody = await res.text().catch(() => "")
        throw new Error(`HUB ${res.status}: ${errorBody}`)
      }
      return (await res.json()) as T
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000))
        continue
      }
      throw err
    }
  }
  throw new Error("Unreachable")
}

// --- Sprite helper ---
export function getSpriteUrl(emoji: string): string {
  const codePoints = [...emoji]
    .map((c) => c.codePointAt(0)!.toString(16))
    .join("-")
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codePoints}.png`
}

// --- localStorage keys ---
export const HUB_ID_KEY = "hubRegenmonId"
export const HUB_REGISTERED_KEY = "isRegisteredInHub"
export const HUB_BALANCE_KEY = "hubBalance"
export const OWNER_NAME_KEY = "regenmon-owner-name"

export function getHubId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(HUB_ID_KEY)
}

export function isRegistered(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(HUB_REGISTERED_KEY) === "true" && !!localStorage.getItem(HUB_ID_KEY)
}

export function getHubBalance(): number {
  if (typeof window === "undefined") return 0
  try {
    return parseInt(localStorage.getItem(HUB_BALANCE_KEY) || "0", 10)
  } catch {
    return 0
  }
}

export function setHubBalance(bal: number) {
  if (typeof window === "undefined") return
  localStorage.setItem(HUB_BALANCE_KEY, String(bal))
}

export function getOwnerName(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem(OWNER_NAME_KEY) || ""
}

export function setOwnerName(name: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(OWNER_NAME_KEY, name)
}

// --- API Types ---
export interface RegisterResponse {
  success: boolean
  alreadyRegistered?: boolean
  data: {
    id: string
    name: string
    appUrl: string
    balance: number
    [key: string]: unknown
  }
}

export interface SyncResponse {
  data: {
    balance: number
    tokensEarned: number
    totalPoints: number
  }
}

export interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  ownerName: string
  sprite: string
  stage: number
  totalPoints: number
  balance: number
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[]
  pagination: {
    page: number
    totalPages: number
    total: number
  }
}

export interface RegenmonProfile {
  id: string
  name: string
  ownerName: string
  sprite: string
  stage: number
  stats: { happiness: number; energy: number; hunger: number }
  totalPoints: number
  balance: number
  totalVisits: number
  registeredAt: string
}

export interface ProfileResponse {
  data: RegenmonProfile
}

export interface FeedResponse {
  data: {
    senderBalance: number
    targetName: string
    cost: number
  }
}

export interface GiftResponse {
  data: {
    senderBalance: number
    targetName: string
    amount: number
  }
}

export interface HubMessage {
  id: string
  fromName: string
  message: string
  createdAt: string
}

export interface MessagesResponse {
  data: {
    messages: HubMessage[]
  }
}

export interface ActivityItem {
  type: string
  description: string
  amount?: number
  createdAt: string
}

export interface ActivityResponse {
  data: {
    activity: ActivityItem[]
  }
}

// --- API calls ---

export async function registerInHub(body: {
  name: string
  ownerName: string
  ownerEmail?: string
  appUrl: string
  sprite: string
}): Promise<RegisterResponse> {
  const res = await hubFetch<RegisterResponse>("/register", {
    method: "POST",
    body: JSON.stringify(body),
  })

  // Save immediately
  localStorage.setItem(HUB_ID_KEY, res.data.id)
  localStorage.setItem(HUB_REGISTERED_KEY, "true")
  setHubBalance(res.data.balance ?? 0)

  return res
}

export async function syncWithHub(body: {
  regenmonId: string
  stats: { happiness: number; energy: number; hunger: number }
  totalPoints: number
  trainingHistory: unknown[]
}): Promise<SyncResponse> {
  const res = await hubFetch<SyncResponse>("/sync", {
    method: "POST",
    body: JSON.stringify(body),
  })
  if (res.data?.balance != null) {
    setHubBalance(res.data.balance)
  }
  return res
}

export async function fetchLeaderboard(
  page = 1,
  limit = 10
): Promise<LeaderboardResponse> {
  return hubFetch<LeaderboardResponse>(
    `/leaderboard?page=${page}&limit=${limit}`
  )
}

export async function fetchProfile(id: string): Promise<ProfileResponse> {
  return hubFetch<ProfileResponse>(`/regenmon/${id}`)
}

export async function feedRegenmon(
  targetId: string,
  fromId: string
): Promise<FeedResponse> {
  const res = await hubFetch<FeedResponse>(`/regenmon/${targetId}/feed`, {
    method: "POST",
    body: JSON.stringify({ fromRegenmonId: fromId }),
  })
  if (res.data?.senderBalance != null) {
    setHubBalance(res.data.senderBalance)
  }
  return res
}

export async function sendGift(
  targetId: string,
  fromId: string,
  amount: number
): Promise<GiftResponse> {
  const res = await hubFetch<GiftResponse>(`/regenmon/${targetId}/gift`, {
    method: "POST",
    body: JSON.stringify({ fromRegenmonId: fromId, amount }),
  })
  if (res.data?.senderBalance != null) {
    setHubBalance(res.data.senderBalance)
  }
  return res
}

export async function fetchMessages(
  targetId: string,
  limit = 20
): Promise<MessagesResponse> {
  return hubFetch<MessagesResponse>(
    `/regenmon/${targetId}/messages?limit=${limit}`
  )
}

export async function sendMessage(
  targetId: string,
  fromId: string,
  fromName: string,
  message: string
): Promise<void> {
  await hubFetch(`/regenmon/${targetId}/messages`, {
    method: "POST",
    body: JSON.stringify({ fromRegenmonId: fromId, fromName, message }),
  })
}

export async function fetchActivity(
  hubId: string,
  limit = 10
): Promise<ActivityResponse> {
  return hubFetch<ActivityResponse>(
    `/regenmon/${hubId}/activity?limit=${limit}`
  )
}
