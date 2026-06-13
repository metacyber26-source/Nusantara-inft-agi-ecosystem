"use client"

import { useState } from "react"
import {
  Sparkles,
  ImageIcon,
  Type,
  ShieldCheck,
  Bot,
  Boxes,
  Check,
  Loader2,
  Languages,
  MessageSquare,
  Brain,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  LANGUAGES,
  EXPORT_FORMATS,
  type Language,
  type InftFormat,
} from "@/lib/forge-config"
import { LanguageBadges } from "@/components/inft-badges"
import { ForgeCreditsPaymentButton } from "@/components/forge-credit-payment-button"
import { Generate3DInftPaymentButton } from "@/components/3d-inft-generator-payment-button"
import { cn } from "@/lib/utils"
import type { Inft } from "@/lib/forge-data"
import { MintDialog } from "@/components/mint-dialog"
import { BatchMintButton } from "@/components/batch-mint-button"
import { initializeCognitiveProfile, generateBehaviorPrompt } from "@/lib/cognitive-agent"

type InputMode = "text" | "2d"
type Phase = "input" | "scanning" | "generating" | "preview"

const SCAN_STEPS = [
  "Loading AI vision scanner",
  "Checking digital copyrights",
  "Cross-referencing known assets",
  "Authenticity verified for ICP2E Jatim",
]

const GEN_STEPS = [
  "Synthesizing base geometry",
  "Auto-compressing polygon count",
  "Applying low-poly metaverse mode",
  "High-fidelity skeleton auto-rigging",
  "Seamless mesh deformation pass",
]

export function ForgeView() {
  const [mode, setMode] = useState<InputMode>("text")
  const [prompt, setPrompt] = useState("")
  const [imageName, setImageName] = useState<string | null>(null)
  const [languages, setLanguages] = useState<Language[]>(["EN", "ID", "JV"])
  const [phase, setPhase] = useState<Phase>("input")
  const [progress, setProgress] = useState(0)
  const [stepLabel, setStepLabel] = useState("")
  const [chatLog, setChatLog] = useState<{ role: "user" | "inft"; text: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [mintOpen, setMintOpen] = useState(false)

  const generated: Inft = {
    id: `nft-${Date.now()}`,
    name: prompt ? prompt.split(" ").slice(0, 3).join(" ") : "Untitled iNFT",
    creator: "you",
    format: (mode === "2d" ? "3D" : "3D") as InftFormat,
    languages,
    price: 5,
    description: prompt || "AGI-generated interactive iNFT.",
    polyCount: "7.4k tris (low-poly optimized)",
    rigged: true,
    forSale: false,
    forRent: false,
    motif: "motif-kawung",
    cognitiveProfile: initializeCognitiveProfile(`nft-${Date.now()}`),
  }

  const toggleLang = (l: Language) => {
    setLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
    )
  }

  const runSequence = async (steps: string[], from: number, to: number) => {
    for (let i = 0; i < steps.length; i++) {
      setStepLabel(steps[i])
      const target = from + ((to - from) * (i + 1)) / steps.length
      await new Promise((r) => setTimeout(r, 550))
      setProgress(Math.round(target))
    }
  }

  const handleGenerate = async () => {
    if (mode === "text" && !prompt.trim()) return
    if (mode === "2d" && !imageName) return
    setProgress(0)
    setPhase("scanning")
    await runSequence(SCAN_STEPS, 0, 40)
    setPhase("generating")
    await runSequence(GEN_STEPS, 40, 100)
    setChatLog([
      {
        role: "inft",
        text:
          languages.includes("JV")
            ? "Sugeng rawuh! I am your new iNFT. Ask me anything before minting."
            : "Hello! I am your new iNFT. Ask me anything before minting.",
      },
    ])
    setPhase("preview")
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    const userText = chatInput.trim()
    setChatLog((prev) => [...prev, { role: "user", text: userText }])
    setChatInput("")
    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          role: "inft",
          text: `[${languages[0] ?? "EN"}] Understood: "${userText}". My personality and ${languages.join("/")} voice are ready for the metaverse.`,
        },
      ])
    }, 500)
  }

  const reset = () => {
    setPhase("input")
    setProgress(0)
    setPrompt("")
    setImageName(null)
    setChatLog([])
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-balance text-2xl font-bold tracking-tight text-glow">
          AGI iNFT Forge
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate, auto-rig, and mint multi-format iNFTs for Web3 games & the Metaverse.
        </p>
      </header>

      {phase === "input" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("text")}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                mode === "text"
                  ? "border-primary/60 bg-primary/10 glow-primary"
                  : "border-border bg-card",
              )}
            >
              <Type className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">Text Prompt</span>
              <span className="text-xs text-muted-foreground">Describe your iNFT</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("2d")}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                mode === "2d"
                  ? "border-primary/60 bg-primary/10 glow-primary"
                  : "border-border bg-card",
              )}
            >
              <ImageIcon className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-semibold">2D Image</span>
              <span className="text-xs text-muted-foreground">Convert to 3D iNFT</span>
            </button>
          </div>

          <Card className="glass-card">
            <CardContent className="space-y-4 pt-6">
              {mode === "text" ? (
                <div className="space-y-2">
                  <Label htmlFor="prompt">Generation prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. A wayang-inspired flying warrior with glowing batik armor..."
                    rows={4}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="image">2D source image</Label>
                  <label
                    htmlFor="image"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-input/40 py-8 text-center"
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">
                      {imageName ?? "Tap to upload a 2D image"}
                    </span>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) =>
                        setImageName(e.target.files?.[0]?.name ?? null)
                      }
                    />
                  </label>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    Anti-plagiarism vision scan runs automatically on input.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-accent" aria-hidden="true" />
                  iNFT languages (voice & text)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => toggleLang(l.code)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        languages.includes(l.code)
                          ? "border-accent/60 bg-accent/15 text-accent"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {l.native}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full"
                size="lg"
                disabled={languages.length === 0}
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Generate iNFT
              </Button>

              <Generate3DInftPaymentButton
                variant="secondary"
                size="lg"
                fullWidth={true}
                compact={false}
              />

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Need more credits?</p>
                <ForgeCreditsPaymentButton variant="secondary" size="sm" fullWidth={true} />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {(phase === "scanning" || phase === "generating") && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {phase === "scanning" ? (
                <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
              ) : (
                <Boxes className="h-5 w-5 text-primary" aria-hidden="true" />
              )}
              {phase === "scanning"
                ? "Anti-Plagiarism Screening"
                : "Auto-Optimization & Rigging"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} />
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {stepLabel}
            </p>
          </CardContent>
        </Card>
      )}

      {phase === "preview" && (
        <div className="space-y-4">
          <Card className="glass-card overflow-hidden">
            <div className="batik-bg flex aspect-video items-center justify-center border-b border-border">
              <div className="flex flex-col items-center gap-2">
                <Boxes className="h-12 w-12 text-primary drop-shadow-[0_0_12px_var(--primary)]" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">3D preview · auto-rigged</span>
              </div>
            </div>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{generated.name}</h2>
                  <p className="text-xs text-muted-foreground">{generated.polyCount}</p>
                </div>
                <LanguageBadges languages={generated.languages} />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                  <Check className="h-3 w-3 text-accent" aria-hidden="true" /> Copyright cleared
                </span>
                <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                  <Check className="h-3 w-3 text-accent" aria-hidden="true" /> Auto-rigged
                </span>
                <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                  <Check className="h-3 w-3 text-accent" aria-hidden="true" /> Low-poly optimized
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {EXPORT_FORMATS.map((f) => (
                  <span
                    key={f}
                    className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-5 w-5 text-accent" aria-hidden="true" />
                Interactive AI Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-input/40 p-3">
                {chatLog.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      m.role === "inft"
                        ? "bg-secondary text-secondary-foreground"
                        : "ml-auto bg-primary text-primary-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Test-chat your iNFT..."
                  rows={1}
                  className="min-h-0 resize-none py-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendChat()
                    }
                  }}
                />
                <Button size="icon" onClick={sendChat} aria-label="Send message">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
                Autonomous Cognitive Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {generated.cognitiveProfile && (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Personality</p>
                      <p className="font-semibold capitalize">{generated.cognitiveProfile.personality}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Evolution Events</p>
                      <p className="font-semibold">{generated.cognitiveProfile.evolutionEvents.length}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Conversational Depth</span>
                        <span className="font-semibold">{generated.cognitiveProfile.conversationalDepth}/100</span>
                      </div>
                      <Progress value={generated.cognitiveProfile.conversationalDepth} />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Game Tactics Proficiency</span>
                        <span className="font-semibold">{generated.cognitiveProfile.gameticticsProficiency}/100</span>
                      </div>
                      <Progress value={generated.cognitiveProfile.gameticticsProficiency} />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">Cross-Platform Experience</span>
                        <span className="font-semibold">{generated.cognitiveProfile.crossPlatformScore}/100</span>
                      </div>
                      <Progress value={generated.cognitiveProfile.crossPlatformScore} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This iNFT will dynamically self-evolve its behavior patterns, conversational depth, and game tactics based on cross-platform metaverse interactions.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={reset}>
              Discard
            </Button>
            <div className="flex-1 space-y-2">
              <Button className="w-full" onClick={() => setMintOpen(true)}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Mint iNFT
              </Button>
              <BatchMintButton
                onSuccess={() => {
                  setMintOpen(true)
                }}
              />
            </div>
          </div>

          <MintDialog
            open={mintOpen}
            onOpenChange={setMintOpen}
            inft={generated}
            onMinted={reset}
          />
        </div>
      )}
    </div>
  )
}
