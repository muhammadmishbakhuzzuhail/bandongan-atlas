"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CircleAlert, Layers3, LoaderCircle, MapPinned } from "lucide-react"
import { GeoMap } from "@/components/map/GeoMap"
import { MapDisplayToggle } from "@/components/map/MapDisplayToggle"
import { VillageLegend } from "@/components/map/VillageLegend"
import { VillageList } from "@/components/village/VillageList"
import { VillageSearch } from "@/components/village/VillageSearch"
import { activeDataset } from "@/data/datasets"
import { getVillageById } from "@/data/villages"
import {
  isFeatureGeometryReady,
  parseVillageGeoJSON,
} from "@/lib/geojson"
import { createOutsideFocusMask } from "@/lib/geo-mask"
import { getRegionColorMap } from "@/lib/region-colors"
import { useVillageSelection } from "@/hooks/useVillageSelection"
import type {
  MapDisplayMode,
  VillageFeature,
  VillageFeatureCollection,
} from "@/types/geo"

type BoundaryState =
  | {
      status: "loading"
      data: null
      focusBoundary: null
      contextBoundary: null
      neighborBoundary: null
      outsideMask: null
      error: null
    }
  | {
      status: "ready"
      data: VillageFeatureCollection
      focusBoundary: VillageFeatureCollection | null
      contextBoundary: VillageFeatureCollection | null
      neighborBoundary: VillageFeatureCollection | null
      outsideMask: VillageFeatureCollection | null
      error: null
    }
  | {
      status: "error"
      data: null
      focusBoundary: null
      contextBoundary: null
      neighborBoundary: null
      outsideMask: null
      error: string
    }

const villageIds = activeDataset.villages.map((village) => village.id)

function getContextFeatureId(feature: VillageFeature) {
  return String(feature.properties?.id ?? feature.id ?? "")
}

function splitContextBoundary(
  contextBoundary: VillageFeatureCollection | null,
  focusIds: readonly string[] | undefined,
) {
  if (!contextBoundary) {
    return { focusBoundary: null, neighborBoundary: null }
  }

  const focusIdSet = new Set(focusIds ?? [])
  const focusFeatures = contextBoundary.features.filter((feature) => {
    const role = feature.properties?.role
    if (role === "neighbor" || role === "context") return false
    if (role === "focus") return true
    return focusIdSet.size ? focusIdSet.has(getContextFeatureId(feature)) : true
  })
  const neighborFeatures = contextBoundary.features.filter((feature) => {
    const role = feature.properties?.role
    if (role === "neighbor" || role === "context") return true
    return focusIdSet.size > 0 && !focusIdSet.has(getContextFeatureId(feature))
  })

  return {
    focusBoundary: { ...contextBoundary, features: focusFeatures },
    neighborBoundary: { ...contextBoundary, features: neighborFeatures },
  }
}

export function DashboardShell() {
  const [boundary, setBoundary] = useState<BoundaryState>({
    status: "loading",
    data: null,
    focusBoundary: null,
    contextBoundary: null,
    neighborBoundary: null,
    outsideMask: null,
    error: null,
  })
  const [listOpen, setListOpen] = useState(false)
  const [displayMode, setDisplayMode] =
    useState<MapDisplayMode>("overlay")
  const [mapError, setMapError] = useState<string | null>(null)
  const { selectedVillageId, selectVillage, clearSelection } =
    useVillageSelection(villageIds)

  useEffect(() => {
    const controller = new AbortController()

    async function loadBoundaryData() {
      try {
        const [regionResponse, contextResponse] = await Promise.all([
          fetch(activeDataset.geoJsonPath, { signal: controller.signal }),
          activeDataset.contextBoundaryPath
            ? fetch(activeDataset.contextBoundaryPath, { signal: controller.signal })
            : Promise.resolve(null),
        ])

        if (!regionResponse.ok) {
          throw new Error(`Region GeoJSON request failed with status ${regionResponse.status}`)
        }
        if (activeDataset.contextBoundaryPath && !contextResponse?.ok) {
          throw new Error(
            `Context GeoJSON request failed with status ${contextResponse?.status ?? "unknown"}`,
          )
        }

        const regionSource: unknown = await regionResponse.json()
        const contextSource: unknown = contextResponse
          ? await contextResponse.json()
          : null
        const data = parseVillageGeoJSON(regionSource)
        const contextBoundary = contextSource
          ? parseVillageGeoJSON(contextSource)
          : null
        const { focusBoundary, neighborBoundary } = splitContextBoundary(
          contextBoundary,
          activeDataset.focusBoundaryIds,
        )
        const outsideMask =
          activeDataset.maskOutsideFocus && focusBoundary
            ? createOutsideFocusMask(focusBoundary)
            : null

        if (activeDataset.maskOutsideFocus && (!focusBoundary || !outsideMask)) {
          throw new Error("Focus mask tidak dapat dibentuk dari boundary resmi.")
        }

        setBoundary({
          status: "ready",
          data,
          focusBoundary,
          contextBoundary,
          neighborBoundary,
          outsideMask,
          error: null,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        console.error(`${activeDataset.title} GeoJSON gagal dimuat.`, error)
        setBoundary({
          status: "error",
          data: null,
          focusBoundary: null,
          contextBoundary: null,
          neighborBoundary: null,
          outsideMask: null,
          error: "Data peta tidak dapat dimuat. Silakan coba kembali.",
        })
      }
    }

    void loadBoundaryData()
    return () => controller.abort()
  }, [])

  const selectedVillage = getVillageById(selectedVillageId, activeDataset.villages)
  const boundaryFeatures = boundary.data?.features ?? []
  const boundaryCount = boundaryFeatures.filter(isFeatureGeometryReady).length
  const colorMap = useMemo(
    () => getRegionColorMap(boundary.data),
    [boundary.data],
  )

  const handleSelectVillage = useCallback(
    (id: string) => {
      selectVillage(id)
      setListOpen(false)
    },
    [selectVillage],
  )

  const handleClearSelection = useCallback(() => {
    clearSelection()
    setListOpen(false)
  }, [clearSelection])

  const boundaryStatus = useMemo(() => {
    if (boundary.status === "loading") return "Memuat boundary"
    if (boundary.status === "error") return "Boundary error"
    if (!boundaryCount) return `${activeDataset.unitLabel} belum terpetakan`
    return `${boundaryCount} ${activeDataset.unitLabelPlural.toLocaleLowerCase("id-ID")} terpetakan`
  }, [boundary.status, boundaryCount])

  return (
    <main className="atlas-shell">
      <header className="atlas-header">
        <div className="atlas-brand">
          <div className="atlas-brand-mark" aria-hidden="true">
            <MapPinned size={19} strokeWidth={1.9} />
          </div>
          <div>
            <p>{activeDataset.brandName}</p>
            <span>{activeDataset.brandSubtitle}</span>
          </div>
        </div>
        <div className="atlas-header-meta">
          <span className="header-status">
            <i aria-hidden="true" />
            {boundaryStatus}
          </span>
          <span className="header-location">{activeDataset.locationLabel}</span>
        </div>
      </header>

      <section className="atlas-workspace" aria-label={`Peta interaktif ${activeDataset.title}`}>
        <div
          className="map-stage"
          data-mask-pending={
            activeDataset.maskOutsideFocus &&
            (boundary.status !== "ready" || !boundary.outsideMask)
              ? "true"
              : "false"
          }
        >
          <GeoMap
            geoJson={boundary.data}
            focusBoundary={boundary.focusBoundary}
            contextBoundary={boundary.contextBoundary}
            neighborBoundary={boundary.neighborBoundary}
            outsideMask={boundary.outsideMask}
            colorMap={colorMap}
            displayMode={displayMode}
            selectedVillageId={selectedVillageId}
            selectedVillage={selectedVillage}
            dataset={activeDataset}
            fallbackViewState={activeDataset.fallbackViewState}
            onSelectVillage={handleSelectVillage}
            onClearSelection={handleClearSelection}
            onMapError={setMapError}
          />

          <div className="map-toolbar">
            <div className="map-context-card">
              <div className="map-context-label">
                <Layers3 size={14} strokeWidth={2} aria-hidden="true" />
                <span>Administrative atlas</span>
              </div>
              <h1>{activeDataset.title}</h1>
              <p>{activeDataset.mapDescription}</p>
            </div>
            <div className="map-action-row">
              <VillageSearch
                villages={activeDataset.villages}
                unitLabel={activeDataset.unitLabel}
                onSelectVillage={handleSelectVillage}
              />
              <VillageList
                villages={activeDataset.villages}
                unitLabel={activeDataset.unitLabel}
                unitLabelPlural={activeDataset.unitLabelPlural}
                selectedVillageId={selectedVillageId}
                isOpen={listOpen}
                onToggle={() => setListOpen((open) => !open)}
                onSelectVillage={handleSelectVillage}
              />
              <MapDisplayToggle mode={displayMode} onChange={setDisplayMode} />
            </div>
          </div>

          {boundary.status === "ready" && boundary.data && boundaryCount > 0 && (
            <VillageLegend
              data={boundary.data}
              selectedVillageId={selectedVillageId}
              unitLabelPlural={activeDataset.unitLabelPlural}
              colorMap={colorMap}
              onSelectVillage={handleSelectVillage}
            />
          )}

          {boundary.status === "loading" && (
            <div className="map-status-card map-status-loading" role="status">
              <LoaderCircle size={16} strokeWidth={2} aria-hidden="true" />
              <span>{activeDataset.loadingLabel}</span>
            </div>
          )}
          {boundary.status === "error" && (
            <div className="map-status-card map-status-error" role="alert">
              <CircleAlert size={17} strokeWidth={2} aria-hidden="true" />
              <div>
                <strong>Data peta tidak dapat dimuat.</strong>
                <span>{boundary.error}</span>
              </div>
              <button type="button" onClick={() => window.location.reload()}>
                Muat ulang
              </button>
            </div>
          )}
          {boundary.status === "ready" && !boundaryCount && (
            <div className="map-status-card map-status-pending" role="status">
              <Layers3 size={17} strokeWidth={1.9} aria-hidden="true" />
              <div>
                <strong>{activeDataset.pendingTitle}</strong>
                <span>{activeDataset.pendingDescription}</span>
              </div>
            </div>
          )}
          {mapError && (
            <div className="map-error-note" role="alert">
              <CircleAlert size={15} aria-hidden="true" />
              <span>{mapError}</span>
              <button
                type="button"
                onClick={() => setMapError(null)}
                aria-label="Tutup pesan error"
              >
                ×
              </button>
            </div>
          )}

          <div className="map-footer-note">
            <span>{activeDataset.boundarySourceLabel}</span>
            <span aria-hidden="true">·</span>
            <span>
              {displayMode === "overlay" ? "Warna desa 40%" : "Citra satelit"}
              {" · "}Navigasi dibatasi Kabupaten Magelang
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
