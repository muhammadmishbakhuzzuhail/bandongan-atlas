"use client"

import { ImageIcon, Palette } from "lucide-react"
import type { MapDisplayMode } from "@/types/geo"

interface MapDisplayToggleProps {
  mode: MapDisplayMode
  onChange: (mode: MapDisplayMode) => void
}

const displayModes = [
  {
    value: "overlay" as const,
    label: "Warna desa",
    shortLabel: "Warna",
    icon: Palette,
  },
  {
    value: "satellite" as const,
    label: "Citra satelit",
    shortLabel: "Satelit",
    icon: ImageIcon,
  },
]

export function MapDisplayToggle({
  mode,
  onChange,
}: MapDisplayToggleProps) {
  return (
    <div
      className="map-display-toggle"
      role="group"
      aria-label="Tampilan peta"
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
            aria-label={`Tampilkan ${item.label.toLocaleLowerCase("id-ID")}`}
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
