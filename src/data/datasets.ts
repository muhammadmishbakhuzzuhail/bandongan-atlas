import { demoNycVillages } from "@/data/demo-villages"
import { villages } from "@/data/villages"
import { FALLBACK_VIEW_STATE } from "@/lib/map"
import type { GeographicDataset } from "@/types/dataset"

export const bandonganDataset: GeographicDataset = {
  id: "bandongan",
  brandName: "Atlas Bandongan",
  brandSubtitle: "Peta desa & statistik",
  title: "Kecamatan Bandongan",
  unitLabel: "Desa",
  unitLabelPlural: "Desa",
  locationLabel: "Kabupaten Magelang · Jawa Tengah",
  mapDescription: "Pilih wilayah desa untuk membuka statistik lokal.",
  loadingLabel: "Memuat peta Kecamatan Bandongan...",
  pendingTitle: "Batas desa belum dapat dirender.",
  pendingDescription:
    "Periksa geometry desa dan konteks kecamatan pada GeoJSON resmi yang dipakai dataset ini.",
  geoJsonPath: "/geojson/bandongan-villages.geojson",
  contextBoundaryPath: "/geojson/magelang-districts.geojson",
  focusBoundaryIds: ["330814"],
  interactionMode: "interactive",
  maskOutsideFocus: true,
  boundarySourceLabel: "BIG · 21 kecamatan Kabupaten Magelang · BPS 2024",
  statisticsDisclaimer:
    "Populasi memakai baseline BPS Kabupaten Magelang, Kecamatan Bandongan Dalam Angka 2024. Indikator yang belum tersedia per desa ditampilkan sebagai N/A.",
  villages,
  fallbackViewState: FALLBACK_VIEW_STATE,
}

export const demoNycDataset: GeographicDataset = {
  id: "nyc-boroughs-demo",
  brandName: "Atlas Geography Demo",
  brandSubtitle: "Borough boundaries & statistics",
  title: "New York City",
  unitLabel: "Borough",
  unitLabelPlural: "Borough",
  locationLabel: "New York · United States",
  mapDescription: "Klik langsung salah satu borough untuk melihat statistik ilustratif.",
  loadingLabel: "Memuat batas borough New York City...",
  pendingTitle: "Boundary demo belum tersedia.",
  pendingDescription: "Periksa file GeoJSON demo dan muat ulang halaman.",
  geoJsonPath: "/geojson/demo-nyc-boroughs.geojson",
  contextBoundaryPath: "/geojson/nyc-city-boundary.geojson",
  interactionMode: "locked",
  maskOutsideFocus: true,
  boundarySourceLabel: "NYC DCP borough boundaries · imagery masked",
  statisticsDisclaimer:
    "Statistik NYC pada panel ini adalah data ilustratif untuk menguji join dan UI, bukan data resmi.",
  villages: demoNycVillages,
  fallbackViewState: {
    longitude: -73.94,
    latitude: 40.71,
    zoom: 9.2,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  },
}

// Bandongan is the production dataset. NYC remains available as a fixture for
// testing MultiPolygon, city masking, and locked-camera behavior.
export const activeDataset: GeographicDataset = bandonganDataset
