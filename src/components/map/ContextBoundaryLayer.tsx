"use client"

import { useMemo } from "react"
import { Layer, Source } from "react-map-gl/maplibre"
import { buildVillageLabelCollection } from "@/lib/geojson"
import type { VillageFeatureCollection } from "@/types/geo"

interface ContextBoundaryLayerProps {
  focusBoundary: VillageFeatureCollection
  neighborBoundary: VillageFeatureCollection
}

export function ContextBoundaryLayer({
  focusBoundary,
  neighborBoundary,
}: ContextBoundaryLayerProps) {
  const neighborLabels = useMemo(
    () => buildVillageLabelCollection(neighborBoundary),
    [neighborBoundary],
  )

  return (
    <>
      {neighborBoundary.features.length > 0 && (
        <Source
          id="neighbor-boundaries"
          type="geojson"
          data={neighborBoundary as unknown as GeoJSON.FeatureCollection}
        >
          <Layer
            id="neighbor-boundary-fill"
            type="fill"
            paint={{
              "fill-color": "#FFFFFF",
              "fill-opacity": 1,
            }}
          />
          <Layer
            id="neighbor-boundary-line"
            type="line"
            paint={{
              "line-color": "#7D8D89",
              "line-width": 1.2,
              "line-opacity": 0.82,
            }}
          />
        </Source>
      )}
      {neighborLabels.features.length > 0 && (
        <Source
          id="neighbor-label-points"
          type="geojson"
          data={neighborLabels as unknown as GeoJSON.FeatureCollection}
        >
          <Layer
            id="neighbor-label"
            type="symbol"
            minzoom={7}
            layout={{
              "text-field": ["get", "name"],
              "text-font": ["Noto Sans Regular"],
              "text-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                7,
                9.5,
                10,
                11.5,
                13,
                13,
              ],
              "text-anchor": "center",
              "text-max-width": 9,
              "text-allow-overlap": true,
              "text-ignore-placement": true,
              "text-padding": 2,
            }}
            paint={{
              "text-color": "#526663",
              "text-halo-color": "#FFFFFF",
              "text-halo-width": 2.5,
              "text-halo-blur": 0.2,
            }}
          />
        </Source>
      )}
      <Source
        id="focus-boundary"
        type="geojson"
        data={focusBoundary as unknown as GeoJSON.FeatureCollection}
      >
        <Layer
          id="focus-boundary-line"
          type="line"
          paint={{
            "line-color": "#173B39",
            "line-width": 2.6,
            "line-opacity": 0.9,
          }}
        />
      </Source>
    </>
  )
}
