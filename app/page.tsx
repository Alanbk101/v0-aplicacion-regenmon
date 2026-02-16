"use client"

import { GameHeader } from "@/components/game-header"
import { RegenmonCard } from "@/components/regenmon-card"
import { useCoins } from "@/hooks/use-coins"
import { useActionHistory } from "@/hooks/use-action-history"

export default function Home() {
  const { coins, coinDelta, spendCoins, earnCoins, canAfford, tryEarnFromChat, feedCost } =
    useCoins(null)
  const { history, logAction } = useActionHistory(null)

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(170 100% 50%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(170 100% 50%) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow spots */}
      <div className="pointer-events-none fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(170_100%_50%/0.03)] blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(330_100%_60%/0.03)] blur-3xl" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-2">
        <GameHeader
          authenticated={false}
          coins={coins}
          coinDelta={coinDelta}
        />
        <RegenmonCard
          userId={null}
          authenticated={false}
          coins={coins}
          feedCost={feedCost}
          canAfford={canAfford}
          spendCoins={spendCoins}
          earnCoins={earnCoins}
          tryEarnFromChat={tryEarnFromChat}
          logAction={logAction}
          history={history}
        />
      </div>
    </main>
  )
}
