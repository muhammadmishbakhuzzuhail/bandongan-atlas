"use client"

import { useEffect, useMemo } from "react"
import type {
  FillLayerSpecification,
  FilterSpecification,
  GeoJSONSource,
  LineLayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl"
import type { MapRef } from "react-map-gl/maplibre"
import { buildVillageLabelCollection } from "@/lib/geojson"
import { getRegionColorExpression, type RegionColorMap } from "@/lib/region-colors"
import { VILLAGE_LABEL_SOURCE_ID, VILLAGE_SOURCE_ID } from "@/lib/map"
import type { MapDisplayMode, VillageFeatureCollection } from "@/types/geo"

interface VillageLayerProps {
  map: MapRef | null
  data: VillageFeatureCollection
  selectedVillageId: string | null
  colorMap: RegionColorMap
  displayMode: MapDisplayMode
}

const VILLAGE_LAYER_IDS = [
  "village-fill",
  "village-border",
] as const

const LABEL_LAYER_IDS = ["village-label", "village-label-selected"] as const

const VILLAGE_OPACITY = {
  normal: 0.4,
  hover: 0.6,
  selected: 0.7,
} as const

const VILLAGE_BORDER_WIDTH = 1

function removeLayersAndSources(map: ReturnType<MapRef["getMap"]>) {
  for (const layerId of [...VILLAGE_LAYER_IDS, ...LABEL_LAYER_IDS]) {
    if (map.getLayer(layerId)) map.removeLayer(layerId)
  }
  if (map.getSource(VILLAGE_LABEL_SOURCE_ID)) {
    map.removeSource(VILLAGE_LABEL_SOURCE_ID)
  }
  if (map.getSource(VILLAGE_SOURCE_ID)) {
    map.removeSource(VILLAGE_SOURCE_ID)
  }
}

export function VillageLayer({
  map: mapRef,
  data,
  selectedVillageId,
  colorMap,
  displayMode,
}: VillageLayerProps) {
  const labels = useMemo(() => buildVillageLabelCollection(data), [data])
  const villageColorExpression = useMemo(
    () => getRegionColorExpression(colorMap),
    [colorMap],
  )

  const selectedFilter = useMemo<FilterSpecification>(
    () =>
      selectedVillageId
        ? ["==", ["get", "id"], selectedVillageId]
        : ["==", ["get", "id"], "__no_selected_village__"],
    [selectedVillageId],
  )
  const overlayVisible = displayMode === "overlay"
  const normalFillOpacity = overlayVisible ? VILLAGE_OPACITY.normal : 0
  const hoverFillOpacity = overlayVisible ? VILLAGE_OPACITY.hover : 0
  const selectedFillOpacity = overlayVisible ? VILLAGE_OPACITY.selected : 0

  useEffect(() => {
    const map = mapRef?.getMap()
    if (!map || !map.isStyleLoaded()) return

    const regionData = data as unknown as GeoJSON.FeatureCollection
    const labelData = labels as unknown as GeoJSON.FeatureCollection

    if (!map.getSource(VILLAGE_SOURCE_ID)) {
      map.addSource(VILLAGE_SOURCE_ID, {
        type: "geojson",
        data: regionData,
        promoteId: "id",
      })
    } else {
      const source = map.getSource(VILLAGE_SOURCE_ID)
      if (source?.type === "geojson") {
        ;(source as GeoJSONSource).setData(regionData)
      }
    }

    if (!map.getSource(VILLAGE_LABEL_SOURCE_ID)) {
      map.addSource(VILLAGE_LABEL_SOURCE_ID, {
        type: "geojson",
        data: labelData,
      })
    } else {
      const source = map.getSource(VILLAGE_LABEL_SOURCE_ID)
      if (source?.type === "geojson") {
        ;(source as GeoJSONSource).setData(labelData)
      }
    }

    const fillLayer: FillLayerSpecification = {
      id: "village-fill",
      type: "fill",
      source: VILLAGE_SOURCE_ID,
      paint: {
        "fill-color": villageColorExpression,
        "fill-opacity": selectedVillageId
          ? [
              "case",
              ["==", ["get", "id"], selectedVillageId],
              selectedFillOpacity,
              ["boolean", ["feature-state", "hover"], false],
              hoverFillOpacity,
              normalFillOpacity,
            ]
          : [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              hoverFillOpacity,
              normalFillOpacity,
            ],
      },
    }
    const borderLayer: LineLayerSpecification = {
      id: "village-border",
      type: "line",
      source: VILLAGE_SOURCE_ID,
      paint: {
        "line-color": villageColorExpression,
        "line-width": VILLAGE_BORDER_WIDTH,
        "line-opacity": selectedVillageId
          ? [
              "case",
              ["==", ["get", "id"], selectedVillageId],
              VILLAGE_OPACITY.selected,
              ["boolean", ["feature-state", "hover"], false],
              VILLAGE_OPACITY.hover,
              VILLAGE_OPACITY.normal,
            ]
          : [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              VILLAGE_OPACITY.hover,
              VILLAGE_OPACITY.normal,
            ],
      },
    }
    const labelLayer: SymbolLayerSpecification = {
      id: "village-label",
      type: "symbol",
      source: VILLAGE_LABEL_SOURCE_ID,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          11,
          9,
          12,
          12,
          14,
          15,
          16,
        ],
        "text-anchor": "center",
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "text-padding": 4,
      },
      paint: {
        "text-color": "#123A36",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 2.8,
        "text-halo-blur": 0.1,
      },
    }
    const selectedLabelLayer: SymbolLayerSpecification = {
      id: "village-label-selected",
      type: "symbol",
      source: VILLAGE_LABEL_SOURCE_ID,
      filter: selectedFilter,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 16,
        "text-anchor": "center",
        "text-allow-overlap": true,
      },
      paint: {
        "text-color": "#102E2B",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 3,
      },
    }
    const layers = [
      fillLayer,
      borderLayer,
      labelLayer,
      selectedLabelLayer,
    ]

    for (const layer of layers) {
      if (!map.getLayer(layer.id)) map.addLayer(layer)
    }

    if (map.getLayer("village-fill")) {
      map.setPaintProperty("village-fill", "fill-color", villageColorExpression)
      map.setPaintProperty(
        "village-fill",
        "fill-opacity",
        selectedVillageId
          ? [
              "case",
              ["==", ["get", "id"], selectedVillageId],
              selectedFillOpacity,
              ["boolean", ["feature-state", "hover"], false],
              hoverFillOpacity,
              normalFillOpacity,
            ]
          : [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              hoverFillOpacity,
              normalFillOpacity,
            ],
      )
    }
    if (map.getLayer("village-border")) {
      map.setPaintProperty(
        "village-border",
        "line-color",
        villageColorExpression,
      )
      map.setPaintProperty(
        "village-border",
        "line-width",
        VILLAGE_BORDER_WIDTH,
      )
      map.setPaintProperty(
        "village-border",
        "line-opacity",
        selectedVillageId
          ? [
              "case",
              ["==", ["get", "id"], selectedVillageId],
              VILLAGE_OPACITY.selected,
              ["boolean", ["feature-state", "hover"], false],
              VILLAGE_OPACITY.hover,
              VILLAGE_OPACITY.normal,
            ]
          : [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              VILLAGE_OPACITY.hover,
              VILLAGE_OPACITY.normal,
            ],
      )
    }
    if (map.getLayer("village-label-selected")) {
      map.setFilter("village-label-selected", selectedFilter)
    }

    return () => {
      if (map.isStyleLoaded()) removeLayersAndSources(map)
    }
  }, [
    colorMap,
    data,
    displayMode,
    labels,
    mapRef,
    selectedFilter,
    selectedVillageId,
    villageColorExpression,
    hoverFillOpacity,
    normalFillOpacity,
    selectedFillOpacity,
  ])

  return null
}
