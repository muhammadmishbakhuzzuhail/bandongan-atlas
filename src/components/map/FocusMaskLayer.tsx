"use client"

import { Layer, Source } from "react-map-gl/maplibre"
import type { VillageFeatureCollection } from "@/types/geo"

interface FocusMaskLayerProps {
  outsideMask: VillageFeatureCollection
}

export function FocusMaskLayer({ outsideMask }: FocusMaskLayerProps) {
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
          "fill-color": "#FFFFFF",
          "fill-opacity": 1,
        }}
      />
    </Source>
  )
}
