import type { Feature, Position } from "geojson"
import type {
  Coordinate,
  GeoBounds,
  VillageFeature,
  VillageFeatureCollection,
  VillageGeoJsonProperties,
  VillageGeometry,
  VillageLabelCollection,
} from "@/types/geo"

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function isCoordinate(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  )
}

function containsCoordinate(value: unknown): boolean {
  if (isCoordinate(value)) return true
  return Array.isArray(value) && value.some(containsCoordinate)
}

function normalizeGeometry(value: unknown): VillageGeometry {
  if (value === null) return null
  if (!isRecord(value)) return null

  const type = value.type
  if (
    (type !== "Polygon" && type !== "MultiPolygon") ||
    !Array.isArray(value.coordinates) ||
    !containsCoordinate(value.coordinates)
  ) {
    return null
  }

  return {
    type,
    coordinates: value.coordinates,
  } as VillageGeometry
}

function normalizeProperties(value: unknown): VillageGeoJsonProperties {
  return isRecord(value) ? { ...value } : {}
}

function getRawVillageId(
  feature: UnknownRecord,
  properties: VillageGeoJsonProperties,
  index: number,
) {
  const propertyId = properties.id ?? properties.slug
  if (typeof propertyId === "string" || typeof propertyId === "number") {
    return String(propertyId)
  }

  const featureId = feature.id
  if (typeof featureId === "string" || typeof featureId === "number") {
    return String(featureId)
  }

  return `feature-${index + 1}`
}

export function parseVillageGeoJSON(input: unknown): VillageFeatureCollection {
  if (!isRecord(input) || input.type !== "FeatureCollection") {
    throw new Error("GeoJSON harus berupa FeatureCollection.")
  }

  if (!Array.isArray(input.features)) {
    throw new Error("GeoJSON tidak memiliki daftar features yang valid.")
  }

  const features: VillageFeature[] = []

  input.features.forEach((rawFeature, index) => {
    if (!isRecord(rawFeature) || rawFeature.type !== "Feature") return

    const properties = normalizeProperties(rawFeature.properties)
    const id = getRawVillageId(rawFeature, properties, index)
    const name =
      readString(properties.name) ?? readString(properties.slug) ?? id
    const geometry = normalizeGeometry(rawFeature.geometry)

    features.push({
      type: "Feature",
      id,
      properties: { ...properties, id, name },
      geometry,
    })
  })

  return { type: "FeatureCollection", features }
}

export function getVillageFeature(
  collection: VillageFeatureCollection | null | undefined,
  id: string | null | undefined,
) {
  if (!collection || !id) return undefined
  return collection.features.find((feature) => {
    const featureId = String(feature.properties?.id ?? feature.id ?? "")
    const slug = String(feature.properties?.slug ?? "")
    return featureId === id || slug === id
  })
}

function visitCoordinates(value: unknown, visit: (position: Position) => void) {
  if (isCoordinate(value)) {
    visit(value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((child) => visitCoordinates(child, visit))
  }
}

export function getGeoJsonBounds(
  value: VillageFeatureCollection | VillageFeature | null | undefined,
): GeoBounds | null {
  if (!value) return null

  const bounds: GeoBounds = [Infinity, Infinity, -Infinity, -Infinity]
  const visit = (position: Position) => {
    const [longitude, latitude] = position
    bounds[0] = Math.min(bounds[0], longitude)
    bounds[1] = Math.min(bounds[1], latitude)
    bounds[2] = Math.max(bounds[2], longitude)
    bounds[3] = Math.max(bounds[3], latitude)
  }

  if (value.type === "FeatureCollection") {
    value.features.forEach((feature) => {
      if (feature.geometry) visitCoordinates(feature.geometry.coordinates, visit)
    })
  } else if (value.geometry) {
    visitCoordinates(value.geometry.coordinates, visit)
  }

  return Number.isFinite(bounds[0]) ? bounds : null
}

function signedRingArea(ring: Position[]) {
  let area = 0
  for (let index = 0; index < ring.length - 1; index += 1) {
    const current = ring[index]
    const next = ring[index + 1]
    if (!current || !next || !isCoordinate(current) || !isCoordinate(next)) {
      continue
    }
    area += current[0] * next[1] - next[0] * current[1]
  }
  return Math.abs(area / 2)
}

function averageRing(ring: Position[]): Coordinate | null {
  const valid = ring.filter(isCoordinate)
  if (!valid.length) return null

  const totals = valid.reduce(
    (sum, point) => [sum[0] + point[0], sum[1] + point[1]],
    [0, 0],
  )
  return [totals[0] / valid.length, totals[1] / valid.length]
}

function approximateGeometryCenter(geometry: VillageGeometry) {
  if (!geometry) return null

  if (geometry.type === "Polygon") {
    return averageRing(geometry.coordinates[0] ?? [])
  }

  let largestRing: Position[] | undefined
  let largestArea = -1
  geometry.coordinates.forEach((polygon) => {
    const ring = polygon[0]
    const area = ring ? signedRingArea(ring) : 0
    if (ring && area > largestArea) {
      largestArea = area
      largestRing = ring
    }
  })
  return largestRing ? averageRing(largestRing) : null
}

function readLabelCoordinate(properties: VillageGeoJsonProperties) {
  const explicit = properties.labelCoordinates ?? properties.label_coordinates
  if (explicit && isCoordinate(explicit)) {
    return [explicit[0], explicit[1]] as Coordinate
  }

  const longitude = properties.labelLon ?? properties.label_lon
  const latitude = properties.labelLat ?? properties.label_lat
  return typeof longitude === "number" && typeof latitude === "number"
    ? [longitude, latitude]
    : null
}

export function getVillageLabelCoordinate(feature: VillageFeature) {
  return (
    readLabelCoordinate(feature.properties ?? {}) ??
    approximateGeometryCenter(feature.geometry)
  )
}

export function buildVillageLabelCollection(
  collection: VillageFeatureCollection | null | undefined,
): VillageLabelCollection {
  const features: VillageLabelCollection["features"] = []
  collection?.features.forEach((feature) => {
    const coordinate = getVillageLabelCoordinate(feature)
    const id = String(feature.properties?.id ?? feature.id ?? "")
    const name = String(feature.properties?.name ?? id)
    if (!coordinate || !id || !name) return

    features.push({
      type: "Feature",
      id,
      properties: { id, name },
      geometry: { type: "Point", coordinates: coordinate },
    })
  })
  return { type: "FeatureCollection", features }
}

export function getVillageDisplayName(
  feature: VillageFeature | null | undefined,
) {
  return feature?.properties?.name ?? feature?.properties?.slug ?? "Desa"
}

export function isFeatureGeometryReady(feature: VillageFeature) {
  return Boolean(feature.geometry && containsCoordinate(feature.geometry.coordinates))
}

export type GeoJsonFeatureLike = Feature<VillageGeometry, VillageGeoJsonProperties>
