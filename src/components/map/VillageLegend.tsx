"use client"

import { ChevronRight, Layers3 } from "lucide-react"
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
  const features = data.features

  if (!features.length) return null

  return (
    <div className="map-legend" aria-label={`Legenda ${unitLabelPlural.toLocaleLowerCase("id-ID")}`}>
      <div className="map-legend-heading">
        <span>
          <Layers3 size={14} strokeWidth={2} aria-hidden="true" />
          Wilayah
        </span>
        <small>{features.length} area</small>
      </div>
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
                onClick={() => onSelectVillage(id)}
              >
                <i style={{ backgroundColor: color }} aria-hidden="true" />
                <span>{name}</span>
                <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
