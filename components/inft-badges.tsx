import { Badge } from "@/components/ui/badge"
import type { Language, InftFormat } from "@/lib/forge-config"

export function LanguageBadges({ languages }: { languages: Language[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {languages.map((l) => (
        <span
          key={l}
          className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
        >
          {l}
        </span>
      ))}
    </div>
  )
}

const formatColor: Record<InftFormat, string> = {
  "3D": "bg-primary/15 text-primary border-primary/40",
  "2D": "bg-chart-4/15 text-chart-4 border-chart-4/40",
  Text: "bg-chart-2/15 text-chart-2 border-chart-2/40",
  Audio: "bg-chart-5/15 text-chart-5 border-chart-5/40",
}

export function FormatBadge({ format }: { format: InftFormat }) {
  return (
    <Badge variant="outline" className={formatColor[format]}>
      {format}
    </Badge>
  )
}
