"use client"

import { MousePointer2, Network } from "lucide-react"

interface ViewModeToggleProps {
  mode: "interactive" | "infographic"
  onChange: (mode: "interactive" | "infographic") => void
}

const displayModes = [
  {
    value: "interactive" as const,
    label: "Interaktif",
    shortLabel: "Interaktif",
    icon: MousePointer2,
  },
  {
    value: "infographic" as const,
    label: "Infografis",
    shortLabel: "Infografis",
    icon: Network,
  },
]

export function ViewModeToggle({
  mode,
  onChange,
}: ViewModeToggleProps) {
  return (
    <div
      className="map-display-toggle view-mode-toggle"
      role="group"
      aria-label="Mode interaksi"
    >
      {displayModes.map((item) => {
        const Icon = item.icon
        const active = mode === item.value

        return (
          <button
            key={item.value}
            type="button"
            className={`map-display-toggle-button${active ? " is-active" : ""}`}
            aria-pressed={active}
            aria-label={`Mode ${item.label.toLocaleLowerCase("id-ID")}`}
            title={item.label}
            onClick={() => onChange(item.value)}
          >
            <Icon size={15} strokeWidth={2} aria-hidden="true" />
            <span className="map-display-label">{item.label}</span>
            <span className="map-display-label-short">{item.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}
