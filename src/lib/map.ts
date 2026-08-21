import type { StyleSpecification } from "maplibre-gl"
import type { ViewState } from "react-map-gl/maplibre"

export const COLOR_MAP_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {},
  layers: [
    {
      id: "color-map-background",
      type: "background",
      paint: {
        "background-color": "#FBFCFB",
      },
    },
  ],
}

export const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
export const SATELLITE_ATTRIBUTION =
  "© Esri, Maxar, Earthstar Geographics, and the GIS User Community"

/** Fallback only while the official GeoJSON is not present; real bounds always win. */
export const FALLBACK_VIEW_STATE: ViewState = {
  longitude: 110.18,
  latitude: -7.46,
  zoom: 11,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
}

export const VILLAGE_SOURCE_ID = "region-boundaries"
export const VILLAGE_LABEL_SOURCE_ID = "region-labels"
export const MAPLIBRE_WORKER_URL = "/maplibre-gl-worker.mjs"

export const DISTRICT_FIT_PADDING = {
  top: 126,
  right: 46,
  bottom: 48,
  left: 46,
}

export const DISTRICT_FOCUS_MAX_ZOOM = 14

export const MOBILE_FIT_PADDING = {
  top: 126,
  right: 26,
  bottom: 42,
  left: 26,
}

export const CITY_FIT_PADDING = {
  top: 165,
  right: 200,
  bottom: 125,
  left: 200,
}

export const CITY_MOBILE_FIT_PADDING = {
  top: 118,
  right: 38,
  bottom: 100,
  left: 38,
}

export const CITY_OVERVIEW_MAX_ZOOM = 9.5
