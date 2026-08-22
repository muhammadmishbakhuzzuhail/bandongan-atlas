"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, ChevronUp, Layers3, X } from "lucide-react"
import { getVillageDisplayName } from "@/lib/geojson"
import { getRegionColor, type RegionColorMap } from "@/lib/region-colors"
import type { VillageFeatureCollection } from "@/types/geo"

interface VillageLegendProps {
  data: VillageFeatureCollection
  selectedVillageId: string | null
  unitLabelPlural: string
  colorMap: RegionColorMap
  onSelectVillage: (id: string) => void
}

export function VillageLegend({
  data,
  selectedVillageId,
  unitLabelPlural,
  colorMap,
  onSelectVillage,
}: VillageLegendProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const features = data.features

  if (!features.length) return null

  return (
    <>
      {/* Mobile Floating Trigger Button (Visible only on mobile when legend is closed) */}
      {!mobileOpen && (
        <button
          type="button"
          className="map-legend-mobile-trigger"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka daftar wilayah"
          title="Daftar Wilayah"
        >
          <Layers3 size={15} strokeWidth={2} />
          <span>Wilayah</span>
          <small>{features.length}</small>
        </button>
      )}

      {/* Main Legend Panel */}
      <div
        className={`map-legend${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-mobile-open" : ""}`}
        aria-label={`Legenda ${unitLabelPlural.toLocaleLowerCase("id-ID")}`}
      >
        <button
          type="button"
          className="map-legend-heading"
          onClick={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setMobileOpen(false)
            } else {
              setCollapsed((prev) => !prev)
            }
          }}
          aria-expanded={!collapsed}
          title={collapsed ? "Buka daftar wilayah" : "Tutup daftar wilayah"}
        >
          <span>
            <Layers3 size={14} strokeWidth={2} aria-hidden="true" />
            Wilayah
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <small>{features.length}</small>
            <span className="legend-desktop-toggle">
              {collapsed ? (
                <ChevronUp size={14} strokeWidth={2.2} />
              ) : (
                <ChevronDown size={14} strokeWidth={2.2} />
              )}
            </span>
            <span className="legend-mobile-close">
              <X size={15} strokeWidth={2.2} />
            </span>
          </div>
        </button>

        {(!collapsed || mobileOpen) && (
          <div className="map-legend-items" role="list">
            {features.map((feature) => {
              const id = String(feature.properties?.id ?? feature.id ?? "")
              const name = getVillageDisplayName(feature)
              const color = getRegionColor(id, colorMap)

              return (
                <div key={id} role="listitem">
                  <button
                    type="button"
                    className={`map-legend-item${selectedVillageId === id ? " is-selected" : ""}`}
                    aria-pressed={selectedVillageId === id}
                    onClick={() => {
                      onSelectVillage(id)
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setMobileOpen(false)
                      }
                    }}
                  >
                    <i style={{ backgroundColor: color }} aria-hidden="true" />
                    <span>{name}</span>
                    <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
