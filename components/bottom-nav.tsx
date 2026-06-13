"use client"

import { Sparkles, Store, KeyRound, User, Hammer } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewKey = "forge" | "market" | "rental" | "profile"

const items: { key: ViewKey; label: string; icon: typeof Sparkles }[] = [
  { key: "forge", label: "Forge", icon: Hammer },
  { key: "market", label: "Market", icon: Store },
  { key: "rental", label: "Rent", icon: KeyRound },
  { key: "profile", label: "Profile", icon: User },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: ViewKey
  onChange: (v: ViewKey) => void
}) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border glass-card"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <li key={key} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_var(--primary)]")}
                  aria-hidden="true"
                />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
