"use client"

import { useMemo, useState } from "react"
import { Boxes, ImageIcon, Type, Music, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormatBadge, LanguageBadges } from "@/components/inft-badges"
import { MARKETPLACE_SEED, type Inft } from "@/lib/forge-data"
import { loadMinted } from "@/lib/local-store"
import { TransactionDialog } from "@/components/transaction-dialog"
import { MarketplacePaymentButton } from "@/components/marketplace-payment-button"
import { NftMarketplacePaymentButton } from "@/components/nft-marketplace-payment-button"
import type { InftFormat } from "@/lib/forge-config"
import { cn } from "@/lib/utils"

const filters: ("All" | InftFormat)[] = ["All", "3D", "2D", "Text", "Audio"]

const formatIcon: Record<InftFormat, typeof Boxes> = {
  "3D": Boxes,
  "2D": ImageIcon,
  Text: Type,
  Audio: Music,
}

export function MarketplaceView() {
  const [filter, setFilter] = useState<"All" | InftFormat>("All")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Inft | null>(null)

  const items = useMemo(() => {
    const all = [...loadMinted(), ...MARKETPLACE_SEED].filter((i) => i.forSale)
    return all.filter((i) => {
      const matchFilter = filter === "All" || i.format === filter
      const matchQuery =
        !query ||
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.creator.toLowerCase().includes(query.toLowerCase())
      return matchFilter && matchQuery
    })
  }, [filter, query])

  return (
    <div className="space-y-5">
      <header className="space-y-3">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-glow">
          iNFT Marketplace
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse freely. Login with Pi to buy multi-format iNFTs.
        </p>
        <div className="space-y-2">
          <NftMarketplacePaymentButton size="lg" fullWidth />
          <MarketplacePaymentButton size="lg" fullWidth />
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search iNFTs or creators"
          className="pl-9"
          aria-label="Search marketplace"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((inft) => {
          const Icon = formatIcon[inft.format]
          return (
            <Card key={inft.id} className="glass-card overflow-hidden">
              <div className="batik-bg flex aspect-square items-center justify-center border-b border-border">
                <Icon className="h-10 w-10 text-primary drop-shadow-[0_0_10px_var(--primary)]" aria-hidden="true" />
              </div>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-1">
                  <h2 className="line-clamp-1 text-sm font-semibold">{inft.name}</h2>
                  <FormatBadge format={inft.format} />
                </div>
                <p className="text-xs text-muted-foreground">@{inft.creator}</p>
                <LanguageBadges languages={inft.languages} />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm font-bold text-primary">{inft.price} Pi</span>
                </div>
                <Button size="sm" className="w-full" onClick={() => setSelected(inft)}>
                  Buy
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {items.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No iNFTs match your search.
        </p>
      )}

      {selected && (
        <TransactionDialog
          mode="buy"
          inft={selected}
          open={!!selected}
          onOpenChange={(v) => !v && setSelected(null)}
        />
      )}
    </div>
  )
}
