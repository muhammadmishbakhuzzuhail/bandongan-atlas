"use client"

import { useEffect, useMemo } from "react"
import type {
  ExpressionSpecification,
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
  // Cleanup compatibility for sessions hot-reloaded from the previous halo layer.
  "village-boundary-halo",
] as const

const LABEL_LAYER_IDS = ["village-label", "village-label-selected"] as const

const VILLAGE_FILL_OPACITY = {
  overlay: {
    normal: 0.8,
    hover: 1,
    selected: 1,
  },
  satellite: {
    normal: 0,
    hover: 0,
    selected: 0,
  },
} as const

const VILLAGE_BORDER_COLOR = "#FFFFFF"
const VILLAGE_BORDER_WIDTH = 0.9
const VILLAGE_HOVER_BORDER_WIDTH = 1.25
const VILLAGE_SELECTED_BORDER_WIDTH = 1.4
const VILLAGE_BORDER_OPACITY = {
  overlay: {
    normal: 0.46,
    hover: 0.82,
    selected: 0.95,
  },
  satellite: {
    normal: 0.68,
    hover: 1,
    selected: 1,
  },
} as const

function getStateExpression(
  selectedVillageId: string | null,
  selectedValue: number,
  hoverValue: number,
  normalValue: number,
): ExpressionSpecification {
  const expression: unknown[] = ["case"]

  if (selectedVillageId) {
    expression.push(["==", ["get", "id"], selectedVillageId], selectedValue)
  }

  expression.push(
    ["boolean", ["feature-state", "hover"], false],
    hoverValue,
    normalValue,
  )

  return expression as ExpressionSpecification
}

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
  const fillOpacity = overlayVisible
    ? VILLAGE_FILL_OPACITY.overlay
    : VILLAGE_FILL_OPACITY.satellite
  const borderOpacity = overlayVisible
    ? VILLAGE_BORDER_OPACITY.overlay
    : VILLAGE_BORDER_OPACITY.satellite
  const villageBorderOpacityExpression = useMemo(
    () =>
      getStateExpression(
        selectedVillageId,
        borderOpacity.selected,
        borderOpacity.hover,
        borderOpacity.normal,
      ),
    [borderOpacity, selectedVillageId],
  )
  const villageBorderWidthExpression = useMemo<ExpressionSpecification>(() => {
    const expression: unknown[] = ["case"]

    if (selectedVillageId) {
      expression.push(
        ["==", ["get", "id"], selectedVillageId],
        VILLAGE_SELECTED_BORDER_WIDTH,
      )
    }

    expression.push(
      ["boolean", ["feature-state", "hover"], false],
      VILLAGE_HOVER_BORDER_WIDTH,
      VILLAGE_BORDER_WIDTH,
    )

    return expression as ExpressionSpecification
  }, [selectedVillageId])

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
        "fill-opacity": getStateExpression(
          selectedVillageId,
          fillOpacity.selected,
          fillOpacity.hover,
          fillOpacity.normal,
        ),
      },
    }
    const borderLayer: LineLayerSpecification = {
      id: "village-border",
      type: "line",
      source: VILLAGE_SOURCE_ID,
      paint: {
        "line-color": VILLAGE_BORDER_COLOR,
        "line-width": villageBorderWidthExpression,
        "line-opacity": villageBorderOpacityExpression,
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
        getStateExpression(
          selectedVillageId,
          fillOpacity.selected,
          fillOpacity.hover,
          fillOpacity.normal,
        ),
      )
    }
    if (map.getLayer("village-border")) {
      map.setPaintProperty(
        "village-border",
        "line-color",
        VILLAGE_BORDER_COLOR,
      )
      map.setPaintProperty(
        "village-border",
        "line-width",
        villageBorderWidthExpression,
      )
      map.setPaintProperty(
        "village-border",
        "line-opacity",
        villageBorderOpacityExpression,
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
    villageBorderOpacityExpression,
    villageBorderWidthExpression,
    fillOpacity,
  ])

  return null
}
