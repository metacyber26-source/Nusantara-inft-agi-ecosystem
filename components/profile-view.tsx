"use client"

import { useEffect, useState } from "react"
import {
  Crown,
  Languages,
  Wallet,
  Boxes,
  KeyRound,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SplitBreakdown } from "@/components/split-breakdown"
import { FormatBadge } from "@/components/inft-badges"
import { MarketplacePaymentButton } from "@/components/marketplace-payment-button"
import { ForgeCreditsPaymentButton } from "@/components/forge-credit-payment-button"
import {
  LANGUAGES,
  normalizeUsername,
  PRIMARY_SALE_SPLIT,
  MINT_FEE_SPLIT,
  SECONDARY_ROYALTY_SPLIT,
  type Language,
} from "@/lib/forge-config"
import { isPioneerWhitelisted } from "@/lib/pioneer-whitelist"
import {
  loadPrefs,
  savePrefs,
  loadMinted,
  loadRentals,
  type ActiveRental,
} from "@/lib/local-store"
import type { Inft } from "@/lib/forge-data"
import { cn } from "@/lib/utils"

export function ProfileView() {
  const [username, setUsername] = useState("")
  const [lang, setLang] = useState<Language>("EN")
  const [minted, setMinted] = useState<Inft[]>([])
  const [rentals, setRentals] = useState<ActiveRental[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const prefs = loadPrefs()
    setUsername(prefs.username)
    setLang(prefs.preferredLanguage)
    setMinted(loadMinted())
    setRentals(loadRentals())
  }, [])

  const persist = (u: string, l: Language) => {
    savePrefs({ username: normalizeUsername(u), preferredLanguage: l })
  }

  const handleSave = () => {
    persist(username, lang)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-glow">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          ICP2E Jawa Timur · authenticated via Pi Network.
        </p>
      </header>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
            Wallet & Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
            <div className="rounded-full bg-primary/15 p-2">
              <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {username ? `@${username}` : "Pi pioneer"}
              </p>
              <p className="text-xs text-muted-foreground">Wallet connected</p>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              Verified
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Pi username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. pioneer_user"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Verified accounts on the ICP2E Jatim network receive exclusive benefits and fair revenue distribution.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            ⚡ Featured Token Bundle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ForgeCreditsPaymentButton variant="default" compact={true} />
          <p className="text-xs text-muted-foreground">
            Quick recharge for continuous iNFT generation. Premium bundle with locked fair splits.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Languages className="h-5 w-5 text-accent" aria-hidden="true" />
            Preferred Language
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  lang === l.code
                    ? "border-accent/60 bg-accent/15 text-accent"
                    : "border-border text-muted-foreground",
                )}
              >
                {l.native}
              </button>
            ))}
          </div>
          <Button onClick={handleSave} className="w-full" variant="secondary">
            {saved ? "Saved" : "Save preferences"}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Boxes className="h-5 w-5 text-primary" aria-hidden="true" />
            My Minted iNFTs ({minted.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MarketplacePaymentButton variant="secondary" size="sm" />
          {minted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No minted iNFTs yet. Head to the Forge to create your first.
            </p>
          ) : (
            <ul className="space-y-2">
              {minted.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2"
                >
                  <span className="text-sm font-medium">{m.name}</span>
                  <FormatBadge format={m.format} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-5 w-5 text-accent" aria-hidden="true" />
            Active Rentals ({rentals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rentals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active rentals.</p>
          ) : (
            <ul className="space-y-2">
              {rentals.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-sm"
                >
                  <span className="font-medium">{r.inftName}</span>
                  <span className="text-muted-foreground">
                    {r.days}d · {r.totalCost} Pi
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ecosystem Revenue Sharing
        </h2>
        <SplitBreakdown title="Primary Sale & Rent Income" splits={PRIMARY_SALE_SPLIT} />
        <SplitBreakdown title="Mint Fee" splits={MINT_FEE_SPLIT} />
        <SplitBreakdown title="Secondary Royalty" splits={SECONDARY_ROYALTY_SPLIT} />
        <p className="text-xs text-muted-foreground">
          Splits are static config locked in the smart contract and applied at transaction time.
        </p>
      </section>
    </div>
  )
}
