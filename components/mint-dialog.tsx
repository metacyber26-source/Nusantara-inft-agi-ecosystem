"use client"

import { useState } from "react"
import { Loader2, Sparkles, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MINT_FEE_SPLIT, GAS_FEE_PI, isWhitelisted } from "@/lib/forge-config"
import { SplitBreakdown } from "@/components/split-breakdown"
import { loadMinted, saveMinted, loadPrefs } from "@/lib/local-store"
import type { Inft } from "@/lib/forge-data"

export function MintDialog({
  open,
  onOpenChange,
  inft,
  onMinted,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  inft: Inft
  onMinted: () => void
}) {
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle")

  // Whitelist status is matched against the Pi username confirmed by the user.
  const username = loadPrefs().username || null
  const whitelisted = isWhitelisted(username)
  const mintFee = whitelisted ? GAS_FEE_PI : 0.05

  const handleMint = async () => {
    setStatus("processing")
    try {
      await new Promise((r) => setTimeout(r, 1200))
      const minted = loadMinted()
      saveMinted([{ ...inft, forSale: true }, ...minted])
      setStatus("done")
      setTimeout(() => {
        setStatus("idle")
        onOpenChange(false)
        onMinted()
      }, 1100)
    } catch {
      setStatus("idle")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            Mint {inft.name}
          </DialogTitle>
          <DialogDescription>
            Confirm minting via Pi smart contract. Mint fee split is locked by ecosystem config.
          </DialogDescription>
        </DialogHeader>

        {status === "done" ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="rounded-full bg-accent/15 p-3">
              <Sparkles className="h-8 w-8 text-accent" aria-hidden="true" />
            </div>
            <p className="font-semibold">iNFT minted successfully</p>
            <p className="text-sm text-muted-foreground">Added to your collection & marketplace.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
              <span className="text-muted-foreground">Mint fee</span>
              <span className="font-semibold">
                {mintFee} Pi {whitelisted && <span className="text-accent">(gas only · whitelisted)</span>}
              </span>
            </div>
            <SplitBreakdown title="Mint Fee Distribution" splits={MINT_FEE_SPLIT} />
            <DialogFooter>
              <Button
                className="w-full"
                onClick={handleMint}
                disabled={status === "processing"}
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Processing on Pi...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    Confirm & Mint
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
