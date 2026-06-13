import type { RevenueSplit } from "@/lib/forge-config"

const barColors = [
  "bg-primary",
  "bg-accent",
  "bg-chart-4",
  "bg-chart-3",
  "bg-chart-5",
]

export function SplitBreakdown({
  title,
  splits,
}: {
  title: string
  splits: RevenueSplit[]
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {splits.map((s, i) => (
          <div
            key={s.label}
            className={barColors[i % barColors.length]}
            style={{ width: `${s.percent}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <ul className="space-y-1.5">
        {splits.map((s, i) => (
          <li
            key={s.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${barColors[i % barColors.length]}`}
                aria-hidden="true"
              />
              {s.label}
            </span>
            <span className="font-medium tabular-nums">{s.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
