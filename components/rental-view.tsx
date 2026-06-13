"use client"

import { useState } from "react"
import { KeyRound, ShieldCheck, Clock, Coins } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FormatBadge } from "@/components/inft-badges"
import { RENTAL_SEED, MARKETPLACE_SEED, type RentalListing, type Inft } from "@/lib/forge-data"
import { TransactionDialog } from "@/components/transaction-dialog"

export function RentalView() {
  const [selected, setSelected] = useState<Inft | null>(null)

  const openRent = (listing: RentalListing) => {
    const base = MARKETPLACE_SEED.find((i) => i.name === listing.inftName)
    setSelected({
      id: listing.id,
      name: listing.inftName,
      creator: listing.lender,
      format: listing.format,
      languages: base?.languages ?? ["EN"],
      price: 0,
      rentPricePerDay: listing.pricePerDay,
      description: base?.description ?? "",
      polyCount: base?.polyCount ?? "",
      rigged: base?.rigged ?? true,
      forSale: false,
      forRent: true,
      motif: base?.motif ?? "motif-kawung",
    })
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-glow">
          Rental Hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Escrow-based Rent-to-Earn. Lenders earn per the locked revenue split.
        </p>
      </header>

      <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-xs text-accent">
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        All rentals use locked-duration escrow with automatic return conditions.
      </div>

      <div className="space-y-3">
        {RENTAL_SEED.map((listing) => (
          <Card key={listing.id} className="glass-card">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <h2 className="font-semibold">{listing.inftName}</h2>
                  <p className="text-xs text-muted-foreground">Lender @{listing.lender}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <FormatBadge format={listing.format} />
                  {listing.status === "rented" ? (
                    <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
                      Rented
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-chart-4/40 bg-chart-4/10 text-chart-4">
                      Available
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-md bg-secondary px-2 py-1.5">
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <Coins className="h-3 w-3" aria-hidden="true" /> Per day
                  </p>
                  <p className="font-semibold text-foreground">{listing.pricePerDay} Pi</p>
                </div>
                <div className="rounded-md bg-secondary px-2 py-1.5">
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden="true" /> Duration
                  </p>
                  <p className="font-semibold text-foreground">
                    {listing.minDays}–{listing.maxDays}d
                  </p>
                </div>
                <div className="rounded-md bg-secondary px-2 py-1.5">
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Escrow
                  </p>
                  <p className="font-semibold text-foreground">{listing.escrowDeposit} Pi</p>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={listing.status === "rented"}
                onClick={() => openRent(listing)}
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {listing.status === "rented" ? "Currently Rented" : "Rent via Escrow"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <TransactionDialog
          mode="rent"
          inft={selected}
          open={!!selected}
          onOpenChange={(v) => !v && setSelected(null)}
        />
      )}
    </div>
  )
}
