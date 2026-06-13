"use client"

import { useState } from "react"
import { Loader2, Lock, ShoppingCart, KeyRound, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  PRIMARY_SALE_SPLIT,
  RENT_INCOME_SPLIT,
  GAS_FEE_PI,
} from "@/lib/forge-config"
import { SplitBreakdown } from "@/components/split-breakdown"
import type { Inft } from "@/lib/forge-data"
import { loadRentals, saveRentals } from "@/lib/local-store"

export function TransactionDialog({
  mode,
  inft,
  open,
  onOpenChange,
}: {
  mode: "buy" | "rent"
  inft: Inft
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle")
  const [days, setDays] = useState(1)

  const isRent = mode === "rent"
  const perDay = inft.rentPricePerDay ?? 0.5
  const total = isRent ? +(perDay * days + GAS_FEE_PI).toFixed(2) : inft.price
  const splits = isRent ? RENT_INCOME_SPLIT : PRIMARY_SALE_SPLIT

  const handleConfirm = async () => {
    setStatus("processing")
    try {
      await new Promise((r) => setTimeout(r, 1200))
      if (isRent) {
        const rentals = loadRentals()
        saveRentals([
          {
            id: `ar-${Date.now()}`,
            inftName: inft.name,
            days,
            totalCost: total,
            startedAt: Date.now(),
          },
          ...rentals,
        ])
      }
      setStatus("done")
      setTimeout(() => {
        setStatus("idle")
        onOpenChange(false)
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
            {isRent ? (
              <KeyRound className="h-5 w-5 text-accent" aria-hidden="true" />
            ) : (
              <ShoppingCart className="h-5 w-5 text-primary" aria-hidden="true" />
            )}
            {isRent ? "Rent" : "Buy"} {inft.name}
          </DialogTitle>
          <DialogDescription>
            {isRent
              ? "Escrow-based rental. Funds lock until the return condition is met."
              : "Purchase via Pi smart contract. Revenue split is locked by ecosystem config."}
          </DialogDescription>
        </DialogHeader>

        {status === "done" ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <div className="rounded-full bg-accent/15 p-3">
              <Check className="h-8 w-8 text-accent" aria-hidden="true" />
            </div>
            <p className="font-semibold">
              {isRent ? "Rental active" : "Purchase complete"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRent
                ? `Locked for ${days} day${days > 1 ? "s" : ""} in escrow.`
                : "iNFT ownership transferred to your wallet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {isRent && (
              <div className="space-y-2">
                <Label htmlFor="days">Rental duration (days)</Label>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  max={60}
                  value={days}
                  onChange={(e) =>
                    setDays(Math.max(1, Math.min(60, Number(e.target.value) || 1)))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {perDay} Pi/day · Rent-to-Earn pays the lender per the split below.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{total} Pi</span>
            </div>

            <SplitBreakdown
              title={isRent ? "Rent Income Distribution" : "Primary Sale Distribution"}
              splits={splits}
            />

            <DialogFooter>
              <Button
                className="w-full"
                onClick={handleConfirm}
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
                    Confirm {isRent ? "Rental" : "Purchase"}
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
