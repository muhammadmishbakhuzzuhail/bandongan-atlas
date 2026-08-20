"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Map, {
  FullscreenControl,
  type MapLayerMouseEvent,
  type MapRef,
  type ViewState,
} from "react-map-gl/maplibre"
import type { LngLatBoundsLike, PaddingOptions } from "maplibre-gl"
import {
  getGeoJsonBounds,
  getVillageFeature,
  getVillageLabelCoordinate,
} from "@/lib/geojson"
import {
  CITY_FIT_PADDING,
  CITY_MOBILE_FIT_PADDING,
  CITY_OVERVIEW_MAX_ZOOM,
  COLOR_MAP_STYLE,
  DISTRICT_FIT_PADDING,
  DISTRICT_FOCUS_MAX_ZOOM,
  DISTRICT_FOCUS_ZOOM_OFFSET,
  MAPLIBRE_WORKER_URL,
  MOBILE_FIT_PADDING,
  REGENCY_MOBILE_NAVIGATION_PADDING,
  REGENCY_NAVIGATION_PADDING,
  VILLAGE_SOURCE_ID,
} from "@/lib/map"
import type {
  GeoBounds,
  MapDisplayMode,
  VillageFeatureCollection,
} from "@/types/geo"
import type { GeographicDataset } from "@/types/dataset"
import type { RegionColorMap } from "@/lib/region-colors"
import type { VillageStatistic } from "@/types/village"
import { BasemapLayer } from "@/components/map/BasemapLayer"
import { ContextBoundaryLayer } from "@/components/map/ContextBoundaryLayer"
import { FocusMaskLayer } from "@/components/map/FocusMaskLayer"
import { MapControls } from "@/components/map/MapControls"
import { VillageInfoDialog } from "@/components/map/VillageInfoDialog"
import { VillageLayer } from "@/components/map/VillageLayer"
import { VillagePopup } from "@/components/map/VillagePopup"

interface HoverState {
  id: string
  name: string
  longitude: number
  latitude: number
}

interface GeoMapProps {
  geoJson: VillageFeatureCollection | null
  focusBoundary: VillageFeatureCollection | null
  contextBoundary: VillageFeatureCollection | null
  neighborBoundary: VillageFeatureCollection | null
  outsideMask: VillageFeatureCollection | null
  colorMap: RegionColorMap
  displayMode: MapDisplayMode
  selectedVillageId: string | null
  selectedVillage: VillageStatistic | undefined
  dataset: GeographicDataset
  fallbackViewState: ViewState
  onSelectVillage: (id: string) => void
  onClearSelection: () => void
  onMapError?: (message: string) => void
}

function toMapBounds(bounds: GeoBounds): LngLatBoundsLike {
  return [
    [bounds[0], bounds[1]],
    [bounds[2], bounds[3]],
  ]
}

function getFeatureId(event: MapLayerMouseEvent) {
  const feature = event.features?.[0]
  const properties = feature?.properties as Record<string, unknown> | undefined
  const rawId = properties?.id ?? feature?.id ?? properties?.slug
  return typeof rawId === "string" || typeof rawId === "number"
    ? String(rawId)
    : null
}

export function GeoMap({
  geoJson,
  focusBoundary,
  contextBoundary,
  neighborBoundary,
  outsideMask,
  colorMap,
  displayMode,
  selectedVillageId,
  selectedVillage,
  dataset,
  fallbackViewState,
  onSelectVillage,
  onClearSelection,
  onMapError,
}: GeoMapProps) {
  const mapRef = useRef<MapRef>(null)
  const previousHoverId = useRef<string | null>(null)
  const initialBoundaryFitDone = useRef(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapInstance, setMapInstance] = useState<MapRef | null>(null)
  const [hover, setHover] = useState<HoverState | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const isLocked = dataset.interactionMode === "locked"

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mediaQuery.matches)
    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  const fitPadding = useMemo(
    () => {
      if (isLocked) {
        return isMobile ? CITY_MOBILE_FIT_PADDING : CITY_FIT_PADDING
      }
      return isMobile ? MOBILE_FIT_PADDING : DISTRICT_FIT_PADDING
    },
    [isLocked, isMobile],
  )
  const initialFitData = isLocked
    ? contextBoundary ?? focusBoundary ?? geoJson
    : focusBoundary ?? geoJson ?? contextBoundary
  const contextBounds = useMemo(
    () => getGeoJsonBounds(contextBoundary ?? focusBoundary ?? geoJson),
    [contextBoundary, focusBoundary, geoJson],
  )
  const rasterBounds = useMemo(
    () => getGeoJsonBounds(focusBoundary ?? geoJson),
    [focusBoundary, geoJson],
  )
  const navigationPadding: PaddingOptions = isMobile
    ? REGENCY_MOBILE_NAVIGATION_PADDING
    : REGENCY_NAVIGATION_PADDING
  const maskReady =
    !dataset.maskOutsideFocus || Boolean(focusBoundary && outsideMask)
  const selectedFeature = getVillageFeature(geoJson, selectedVillageId)
  const selectedCoordinate = selectedFeature
    ? getVillageLabelCoordinate(selectedFeature)
    : null

  const setFeatureHover = useCallback((id: string | null, value: boolean) => {
    const map = mapRef.current?.getMap()
    if (!map || !map.isStyleLoaded() || !id) return
    map.setFeatureState({ source: VILLAGE_SOURCE_ID, id }, { hover: value })
  }, [])

  const clearHover = useCallback(() => {
    if (previousHoverId.current) {
      setFeatureHover(previousHoverId.current, false)
    }
    previousHoverId.current = null
    setHover(null)
  }, [setFeatureHover])

  const fitToFocus = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const bounds = getGeoJsonBounds(initialFitData)
    if (bounds) {
      const maxZoom = isLocked
        ? CITY_OVERVIEW_MAX_ZOOM
        : DISTRICT_FOCUS_MAX_ZOOM
      if (!isLocked) {
        const focusCamera = map.cameraForBounds(bounds, {
          padding: fitPadding,
          maxZoom,
        })

        if (focusCamera) {
          map.flyTo({
            ...focusCamera,
            zoom: Math.min(
              (focusCamera.zoom ?? fallbackViewState.zoom) +
                DISTRICT_FOCUS_ZOOM_OFFSET,
              maxZoom,
            ),
            duration: 720,
          })
          return
        }
      }

      map.fitBounds(bounds, {
        padding: fitPadding,
        duration: 720,
        maxZoom,
      })
      return
    }

    map.flyTo({
      center: [fallbackViewState.longitude, fallbackViewState.latitude],
      zoom: fallbackViewState.zoom,
      duration: 650,
    })
  }, [fallbackViewState, fitPadding, initialFitData, isLocked])

  const applyNavigationConstraints = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map || isLocked || !contextBounds) return

    const bounds = toMapBounds(contextBounds)
    const overviewCamera = map.cameraForBounds(bounds, {
      padding: navigationPadding,
    })

    map.setMaxBounds(bounds)
    const overviewZoom = overviewCamera?.zoom
    if (typeof overviewZoom === "number") {
      map.setMinZoom(overviewZoom)
      if (map.getZoom() < overviewZoom) {
        map.jumpTo({ zoom: overviewZoom })
      }
    }
  }, [contextBounds, isLocked, navigationPadding])

  useEffect(() => {
    if (!mapReady || isLocked || !contextBounds) return
    const map = mapRef.current?.getMap()
    if (!map) return

    applyNavigationConstraints()
    map.on("resize", applyNavigationConstraints)

    return () => {
      map.off("resize", applyNavigationConstraints)
    }
  }, [applyNavigationConstraints, contextBounds, isLocked, mapReady])

  useEffect(() => {
    if (!mapReady || initialBoundaryFitDone.current) return
    if (!getGeoJsonBounds(initialFitData)) return
    fitToFocus()
    initialBoundaryFitDone.current = true
  }, [fitToFocus, initialFitData, mapReady])

  const enforceLayerOrder = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map || !map.isStyleLoaded()) return

    const desiredOrder = [
      "satellite-imagery-layer",
      "outside-focus-mask-fill",
      "neighbor-boundary-fill",
      "neighbor-boundary-line",
      "focus-boundary-line",
      "village-fill",
      "village-border",
      "neighbor-label",
      "village-label",
      "village-label-selected",
    ]
    const present = desiredOrder.filter((id) => Boolean(map.getLayer(id)))

    for (let index = 0; index < present.length - 1; index += 1) {
      const currentId = present[index]
      const beforeId = present[index + 1]
      if (!currentId || !beforeId) continue

      const layerIds = (map.getStyle().layers ?? []).map((layer) => layer.id)
      if (layerIds.indexOf(currentId) !== layerIds.indexOf(beforeId) - 1) {
        map.moveLayer(currentId, beforeId)
      }
    }

    const lastId = present.at(-1)
    const allLayerIds = (map.getStyle().layers ?? []).map((layer) => layer.id)
    if (lastId && allLayerIds.at(-1) !== lastId) {
      map.moveLayer(lastId)
    }
  }, [])

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current?.getMap()
    if (!map) return

    let frame = 0
    const schedule = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        frame = 0
        enforceLayerOrder()
      })
    }

    map.on("styledata", schedule)
    map.on("idle", schedule)
    schedule()

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      map.off("styledata", schedule)
      map.off("idle", schedule)
    }
  }, [contextBoundary, enforceLayerOrder, focusBoundary, geoJson, mapReady, maskReady, neighborBoundary, outsideMask])

  const handleMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const id = getFeatureId(event)
      if (!id) {
        clearHover()
        return
      }

      if (previousHoverId.current !== id) {
        if (previousHoverId.current) {
          setFeatureHover(previousHoverId.current, false)
        }
        setFeatureHover(id, true)
        previousHoverId.current = id
      }

      const feature = event.features?.[0]
      const properties = feature?.properties as Record<string, unknown> | undefined
      const name = typeof properties?.name === "string" ? properties.name : id

      setHover({
        id,
        name,
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      })
    },
    [clearHover, setFeatureHover],
  )

  const handleClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const id = getFeatureId(event)
      if (id) {
        clearHover()
        onSelectVillage(id)
        return
      }
      onClearSelection()
    },
    [clearHover, onClearSelection, onSelectVillage],
  )

  const handleReset = useCallback(() => {
    onClearSelection()
    fitToFocus()
  }, [fitToFocus, onClearSelection])

  const handleZoomIn = useCallback(() => {
    mapRef.current?.getMap().zoomIn({ duration: 260 })
  }, [])

  const handleZoomOut = useCallback(() => {
    mapRef.current?.getMap().zoomOut({ duration: 260 })
  }, [])

  return (
    <div
      className="map-shell"
      data-hovering={hover ? "true" : "false"}
      data-locked={isLocked ? "true" : "false"}
    >
      <Map
        ref={mapRef}
        initialViewState={fallbackViewState}
        mapStyle={COLOR_MAP_STYLE}
        workerUrl={MAPLIBRE_WORKER_URL}
        dragPan={!isLocked}
        scrollZoom={!isLocked}
        doubleClickZoom={!isLocked}
        boxZoom={!isLocked}
        keyboard={!isLocked}
        dragRotate={false}
        touchPitch={false}
        touchZoomRotate={!isLocked}
        interactiveLayerIds={geoJson ? ["village-fill"] : []}
        onLoad={(event) => {
          if (isLocked) {
            event.target.dragPan.disable()
            event.target.scrollZoom.disable()
            event.target.doubleClickZoom.disable()
            event.target.boxZoom.disable()
            event.target.keyboard.disable()
            event.target.dragRotate.disable()
            event.target.touchPitch.disable()
            event.target.touchZoomRotate.disable()
          } else {
            event.target.dragRotate.disable()
            event.target.touchPitch.disable()
            event.target.touchZoomRotate.disableRotation()
          }
          setMapInstance(mapRef.current)
          setMapReady(true)
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={clearHover}
        onClick={handleClick}
        onError={(event) => {
          console.error("MapLibre gagal memuat style atau tile.", event.error)
          onMapError?.("Basemap tidak dapat dimuat. Coba muat ulang halaman.")
        }}
        reuseMaps
      >
        {mapReady && maskReady && (
          <BasemapLayer
            key={rasterBounds?.join(":") ?? "unbounded-basemap"}
            bounds={rasterBounds}
          />
        )}
        {mapReady && focusBoundary && outsideMask && (
          <FocusMaskLayer outsideMask={outsideMask} />
        )}
        {mapReady && focusBoundary && neighborBoundary && (
          <ContextBoundaryLayer
            focusBoundary={focusBoundary}
            neighborBoundary={neighborBoundary}
          />
        )}
        {mapReady && geoJson && (
          <VillageLayer
            map={mapInstance}
            data={geoJson}
            selectedVillageId={selectedVillageId}
            colorMap={colorMap}
            displayMode={displayMode}
          />
        )}
        {mapReady && hover && !selectedVillageId && (
          <VillagePopup
            longitude={hover.longitude}
            latitude={hover.latitude}
            name={hover.name}
          />
        )}
        {mapReady && selectedVillageId && selectedCoordinate && (
          <VillageInfoDialog
            longitude={selectedCoordinate[0]}
            latitude={selectedCoordinate[1]}
            accentColor={colorMap[selectedVillageId] ?? "#B8DCCB"}
            dataset={dataset}
            village={selectedVillage}
            feature={selectedFeature}
            onClose={onClearSelection}
          />
        )}
        <FullscreenControl position="bottom-right" />
      </Map>

      {!isLocked && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
