import type { ViewState } from "react-map-gl/maplibre"
import type { VillageStatistic } from "@/types/village"

export type MapInteractionMode = "locked" | "interactive"

export interface GeographicDataset {
  id: string
  brandName: string
  brandSubtitle: string
  title: string
  unitLabel: string
  unitLabelPlural: string
  locationLabel: string
  mapDescription: string
  loadingLabel: string
  pendingTitle: string
  pendingDescription: string
  geoJsonPath: string
  /** Context boundary containing the focus area and any surrounding areas. */
  contextBoundaryPath?: string
  /** IDs in the context boundary that define the satellite focus area. */
  focusBoundaryIds?: readonly string[]
  maskOutsideFocus?: boolean
  interactionMode: MapInteractionMode
  boundarySourceLabel: string
  statisticsDisclaimer: string
  villages: readonly VillageStatistic[]
  fallbackViewState: ViewState
}
