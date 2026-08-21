"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Map, {
  FullscreenControl,
  type MapLayerMouseEvent,
  type MapRef,
  type ViewState,
} from "react-map-gl/maplibre"
import type { LngLatBoundsLike } from "maplibre-gl"
import { getVillageById } from "@/data/villages"
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
  MAPLIBRE_WORKER_URL,
  MOBILE_FIT_PADDING,
  VILLAGE_SOURCE_ID,
} from "@/lib/map"
import type {
  GeoBounds,
  MapDisplayMode,
  VillageFeatureCollection,
} from "@/types/geo"
import type { GeographicDataset } from "@/types/dataset"
import type { RegionColorMap } from "@/lib/region-colors"
import type { MasterIndikator } from "@/types/database"
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
  cityContextBoundary: VillageFeatureCollection | null
  outsideMask: VillageFeatureCollection | null
  colorMap: RegionColorMap
  displayMode: MapDisplayMode
  selectedVillageId: string | null
  selectedVillage: VillageStatistic | undefined
  indicators: MasterIndikator[]
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
  cityContextBoundary,
  outsideMask,
  colorMap,
  displayMode,
  selectedVillageId,
  selectedVillage,
  indicators,
  dataset,
  fallbackViewState,
  onSelectVillage,
  onClearSelection,
  onMapError,
}: GeoMapProps) {
  const mapRef = useRef<MapRef>(null)
  const previousHoverId = useRef<string | null>(null)
  const initialBoundaryFitDone = useRef<string | null>(null)
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
  const focusFitData = isLocked
    ? contextBoundary ?? focusBoundary ?? geoJson
    : focusBoundary ?? geoJson ?? contextBoundary
  const focusBounds = useMemo(
    () => getGeoJsonBounds(focusFitData),
    [focusFitData],
  )
  const focusBoundsKey = focusBounds?.join(":") ?? null
  const navigationData =
    dataset.navigationBoundsSource === "focus"
      ? focusBoundary ?? geoJson ?? contextBoundary
      : contextBoundary ?? focusBoundary ?? geoJson
  const navigationBounds = useMemo(
    () => getGeoJsonBounds(navigationData),
    [navigationData],
  )
  const rasterBounds = useMemo(
    () => getGeoJsonBounds(focusBoundary ?? geoJson),
    [focusBoundary, geoJson],
  )
  const maskReady =
    !dataset.maskOutsideFocus || Boolean(focusBoundary && outsideMask)
  const selectedFeature = getVillageFeature(geoJson, selectedVillageId)
  const selectedCoordinate = selectedFeature
    ? getVillageLabelCoordinate(selectedFeature)
    : null
  const hoveredVillage = hover
    ? getVillageById(hover.id, dataset.villages)
    : undefined

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

  const fitToFocus = useCallback(
    (duration = 720) => {
      const map = mapRef.current?.getMap()
      if (!map || !map.isStyleLoaded()) return false

      const container = map.getContainer()
      if (!container.clientWidth || !container.clientHeight) return false

      map.resize()
      if (focusBounds) {
        const maxZoom = isLocked
          ? CITY_OVERVIEW_MAX_ZOOM
          : DISTRICT_FOCUS_MAX_ZOOM
        map.fitBounds(toMapBounds(focusBounds), {
          padding: fitPadding,
          duration,
          maxZoom,
        })
        return true
      }

      map.flyTo({
        center: [fallbackViewState.longitude, fallbackViewState.latitude],
        zoom: fallbackViewState.zoom,
        duration,
      })
      return true
    }, [fallbackViewState, fitPadding, focusBounds, isLocked])

  const applyNavigationConstraints = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map || isLocked || !navigationBounds) return

    const bounds = toMapBounds(navigationBounds)
    const overviewCamera = map.cameraForBounds(bounds, {
      padding: fitPadding,
    })

    map.setMaxBounds(bounds)
    const overviewZoom = overviewCamera?.zoom
    if (typeof overviewZoom === "number") {
      map.setMinZoom(overviewZoom)
      if (map.getZoom() < overviewZoom) {
        map.jumpTo({ zoom: overviewZoom })
      }
    }
  }, [fitPadding, isLocked, navigationBounds])

  useEffect(() => {
    if (!mapReady || isLocked || !navigationBounds) return
    const map = mapRef.current?.getMap()
    if (!map) return

    let frame = 0
    const scheduleConstraints = (resizeMap: boolean) => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        frame = 0
        if (resizeMap) map.resize()
        applyNavigationConstraints()
      })
    }
    const handleMapResize = () => scheduleConstraints(false)
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => scheduleConstraints(true))
        : null

    resizeObserver?.observe(map.getContainer())
    scheduleConstraints(true)
    map.on("resize", handleMapResize)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      map.off("resize", handleMapResize)
    }
  }, [applyNavigationConstraints, isLocked, mapReady, navigationBounds])

  useEffect(() => {
    if (!mapReady || !focusBounds || initialBoundaryFitDone.current === focusBoundsKey) {
      return
    }

    const map = mapRef.current?.getMap()
    if (!map) return

    let frame = 0
    const tryInitialFit = () => {
      if (initialBoundaryFitDone.current === focusBoundsKey) return
      if (frame) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        frame = 0
        if (fitToFocus()) {
          initialBoundaryFitDone.current = focusBoundsKey
        }
      })
    }

    tryInitialFit()
    map.on("idle", tryInitialFit)
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(tryInitialFit)
        : null
    resizeObserver?.observe(map.getContainer())

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      map.off("idle", tryInitialFit)
    }
  }, [fitToFocus, focusBounds, focusBoundsKey, mapReady])

  const enforceLayerOrder = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map || !map.isStyleLoaded()) return

    const desiredOrder = [
      "satellite-imagery-layer",
      "outside-focus-mask-fill",
      "city-context-fill",
      "neighbor-boundary-fill",
      "city-context-line",
      "neighbor-boundary-line",
      "village-fill",
      "village-border",
      "focus-boundary-line",
      "city-context-label",
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
  }, [
    cityContextBoundary,
    contextBoundary,
    enforceLayerOrder,
    focusBoundary,
    geoJson,
    mapReady,
    maskReady,
    neighborBoundary,
    outsideMask,
  ])

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
        interactiveLayerIds={
          geoJson ? ["village-fill", "village-border"] : []
        }
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
        {mapReady && displayMode === "satellite" && maskReady && (
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
            cityContextBoundary={cityContextBoundary}
            cityContextLabel={dataset.cityContextLabel}
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
            village={hoveredVillage}
            indicators={indicators}
          />
        )}
        {mapReady && selectedVillageId && selectedCoordinate && (
          <VillageInfoDialog
            longitude={selectedCoordinate[0]}
            latitude={selectedCoordinate[1]}
            accentColor={colorMap[selectedVillageId] ?? "#B8DCCB"}
            indicators={indicators}
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
