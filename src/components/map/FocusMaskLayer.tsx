"use client"

import { Layer, Source } from "react-map-gl/maplibre"
import type { VillageFeatureCollection, MapDisplayMode } from "@/types/geo"

interface FocusMaskLayerProps {
  outsideMask: VillageFeatureCollection
  displayMode: MapDisplayMode
}

export function FocusMaskLayer({ outsideMask, displayMode }: FocusMaskLayerProps) {
  return (
    <Source
      id="outside-focus-mask"
      type="geojson"
      data={outsideMask as unknown as GeoJSON.FeatureCollection}
    >
      <Layer
        id="outside-focus-mask-fill"
        type="fill"
        paint={{
          "fill-color": displayMode === "satellite" ? "#f4f4f4" : "rgba(255, 255, 255, 0)",
          "fill-opacity": displayMode === "satellite" ? 1 : 0,
        }}
      />
    </Source>
  )
}
