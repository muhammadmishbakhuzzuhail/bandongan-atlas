"use client"

import { Layer, Source } from "react-map-gl/maplibre"
import {
  SATELLITE_ATTRIBUTION,
  SATELLITE_TILE_URL,
} from "@/lib/map"
import type { GeoBounds } from "@/types/geo"

interface BasemapLayerProps {
  bounds?: GeoBounds | null
}

export function BasemapLayer({ bounds }: BasemapLayerProps) {
  return (
    <Source
      id="satellite-imagery"
      type="raster"
      tiles={[SATELLITE_TILE_URL]}
      tileSize={256}
      bounds={bounds ?? undefined}
      attribution={SATELLITE_ATTRIBUTION}
    >
      <Layer
        id="satellite-imagery-layer"
        type="raster"
        paint={{ "raster-opacity": 0.96 }}
      />
    </Source>
  )
}
