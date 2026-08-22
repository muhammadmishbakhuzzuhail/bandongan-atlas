"use client"

import { useMemo } from "react"
import { Layer, Source } from "react-map-gl/maplibre"
import {
  buildAggregateLabelCollection,
  buildVillageLabelCollection,
} from "@/lib/geojson"
import type { VillageFeatureCollection, MapDisplayMode } from "@/types/geo"

interface ContextBoundaryLayerProps {
  focusBoundary: VillageFeatureCollection
  neighborBoundary: VillageFeatureCollection
  cityContextBoundary: VillageFeatureCollection | null
  cityContextLabel?: string
  displayMode: MapDisplayMode
}

const DISTRICT_BOUNDARY_COLOR = "#222222"

export function ContextBoundaryLayer({
  focusBoundary,
  neighborBoundary,
  cityContextBoundary,
  cityContextLabel,
  displayMode,
}: ContextBoundaryLayerProps) {
  const cityContextLabels = useMemo(
    () =>
      cityContextLabel
        ? buildAggregateLabelCollection(
            cityContextBoundary,
            cityContextLabel,
            "city-context-label",
          )
        : buildVillageLabelCollection(cityContextBoundary),
    [cityContextBoundary, cityContextLabel],
  )
  const neighborLabels = useMemo(
    () => buildVillageLabelCollection(neighborBoundary),
    [neighborBoundary],
  )

  return (
    <>
      {cityContextBoundary && cityContextBoundary.features.length > 0 && (
        <Source
          id="city-context-boundaries"
          type="geojson"
          data={cityContextBoundary as unknown as GeoJSON.FeatureCollection}
        >
          <Layer
            id="city-context-fill"
            type="fill"
            paint={{
              "fill-color": displayMode === "satellite" ? "#f4f4f4" : "rgba(255, 255, 255, 0)",
              "fill-opacity": displayMode === "satellite" ? 1 : 0,
            }}
          />
          <Layer
            id="city-context-line"
            type="line"
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
            paint={{
              "line-color": DISTRICT_BOUNDARY_COLOR,
              "line-width": 1,
              "line-opacity": 0.68,
            }}
          />
        </Source>
      )}
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
              "fill-color": displayMode === "satellite" ? "#f4f4f4" : "rgba(255, 255, 255, 0)",
              "fill-opacity": displayMode === "satellite" ? 1 : 0,
            }}
          />
          <Layer
            id="neighbor-boundary-line"
            type="line"
            paint={{
              "line-color": DISTRICT_BOUNDARY_COLOR,
              "line-width": 1,
              "line-opacity": 0.68,
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
      {cityContextLabels.features.length > 0 && (
        <Source
          id="city-context-label-points"
          type="geojson"
          data={cityContextLabels as unknown as GeoJSON.FeatureCollection}
        >
          <Layer
            id="city-context-label"
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
                10,
                10,
                12,
                13,
                13,
              ],
              "text-anchor": "center",
              "text-max-width": 10,
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
            "line-color": DISTRICT_BOUNDARY_COLOR,
            "line-width": 1.7,
            "line-opacity": 0.9,
          }}
        />
      </Source>
    </>
  )
}
