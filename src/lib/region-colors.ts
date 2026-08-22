import booleanTouches from "@turf/boolean-touches"
import type { ExpressionSpecification } from "maplibre-gl"
import type { Feature, MultiPolygon, Polygon, Position } from "geojson"
import type { VillageFeature, VillageFeatureCollection } from "@/types/geo"

export const REGION_COLOR_PALETTE = [
  "#FF9E9E",
  "#8CE0DA",
  "#89CDE0",
  "#FDE0A6",
  "#A297ED",
  "#FFC2F7",
  "#7CEAEA",
  "#97C5FF",
  "#9873E0",
  "#FFC285",
  "#75E6C3",
  "#F49495",
  "#67C7C8",
  "#FEDF95",
] as const

export type RegionColorMap = Readonly<Record<string, string>>

interface RegionEntry {
  id: string
  feature: VillageFeature
}

function getFeatureId(feature: VillageFeature) {
  return String(feature.properties?.id ?? feature.id ?? "")
}

function getExpandedColor(index: number) {
  if (index < REGION_COLOR_PALETTE.length) {
    return REGION_COLOR_PALETTE[index]
  }

  const hue = (index * 137.508) % 360
  const saturation = 39 / 100
  const lightness = 76 / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const match = lightness - chroma / 2
  const [red, green, blue] =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x]

  const toHex = (value: number) =>
    Math.round((value + match) * 255)
      .toString(16)
      .padStart(2, "0")

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

function getFallbackColor(id: string) {
  let hash = 0
  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }
  return getExpandedColor(hash % REGION_COLOR_PALETTE.length)
}

function getGeometryFeature(feature: VillageFeature) {
  if (!feature.geometry) return null
  return feature as Feature<Polygon | MultiPolygon>
}

function isPosition(value: unknown): value is Position {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  )
}

function collectBoundaryPositions(value: unknown, positions: Position[] = []) {
  if (isPosition(value)) {
    positions.push(value)
    return positions
  }

  if (Array.isArray(value)) {
    value.forEach((child) => collectBoundaryPositions(child, positions))
  }

  return positions
}

function positionKey(position: Position) {
  return `${position[0].toFixed(6)}:${position[1].toFixed(6)}`
}

function shareBoundaryCoordinates(
  left: Feature<Polygon | MultiPolygon>,
  right: Feature<Polygon | MultiPolygon>,
) {
  const leftPositions = collectBoundaryPositions(left.geometry.coordinates)
  const rightPositions = collectBoundaryPositions(right.geometry.coordinates)
  const rightKeys = new Set(rightPositions.map(positionKey))
  let sharedCoordinates = 0

  for (const position of leftPositions) {
    if (!rightKeys.has(positionKey(position))) continue
    sharedCoordinates += 1
    if (sharedCoordinates >= 2) return true
  }

  return false
}

function geometriesTouch(
  left: Feature<Polygon | MultiPolygon>,
  right: Feature<Polygon | MultiPolygon>,
) {
  try {
    if (booleanTouches(left, right)) return true
  } catch (error) {
    console.warn("Adjacency check Turf gagal; memakai shared-boundary fallback.", error)
  }

  // Some generalized administrative datasets preserve shared boundary vertices
  // but fail Turf's strict topological touches predicate. Two shared vertices
  // are enough to identify a shared boundary segment without changing geometry.
  return shareBoundaryCoordinates(left, right)
}

/**
 * Assigns colors using a deterministic DSATUR-style graph coloring pass.
 * A color may repeat only when two regions do not touch geometrically.
 */
export function getRegionColorMap(
  collection: VillageFeatureCollection | null | undefined,
): RegionColorMap {
  const entries: RegionEntry[] = (collection?.features ?? [])
    .map((feature) => ({ id: getFeatureId(feature), feature }))
    .filter((entry) => entry.id && Boolean(entry.feature.geometry))
    .sort((left, right) => left.id.localeCompare(right.id))

  const neighbors = new Map<string, Set<string>>()
  entries.forEach(({ id }) => neighbors.set(id, new Set()))

  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    const left = entries[leftIndex]
    if (!left) continue
    const leftGeometry = getGeometryFeature(left.feature)
    if (!leftGeometry) continue

    for (
      let rightIndex = leftIndex + 1;
      rightIndex < entries.length;
      rightIndex += 1
    ) {
      const right = entries[rightIndex]
      if (!right) continue
      const rightGeometry = getGeometryFeature(right.feature)
      if (!rightGeometry) continue

      try {
        if (!geometriesTouch(leftGeometry, rightGeometry)) continue
        neighbors.get(left.id)?.add(right.id)
        neighbors.get(right.id)?.add(left.id)
      } catch (error) {
        console.warn(`Adjacency check gagal untuk ${left.id} dan ${right.id}.`, error)
      }
    }
  }

  const assigned = new Map<string, number>()
  const remaining = new Set(entries.map((entry) => entry.id))
  const usedGlobally = new Set<number>()

  while (remaining.size) {
    const nextId = [...remaining].sort((left, right) => {
      const leftNeighbors = neighbors.get(left) ?? new Set<string>()
      const rightNeighbors = neighbors.get(right) ?? new Set<string>()
      const leftSaturation = new Set(
        [...leftNeighbors]
          .map((neighbor) => assigned.get(neighbor))
          .filter((color): color is number => color !== undefined),
      ).size
      const rightSaturation = new Set(
        [...rightNeighbors]
          .map((neighbor) => assigned.get(neighbor))
          .filter((color): color is number => color !== undefined),
      ).size

      return (
        rightSaturation - leftSaturation ||
        rightNeighbors.size - leftNeighbors.size ||
        left.localeCompare(right)
      )
    })[0]

    if (!nextId) break
    const usedColors = new Set(
      [...(neighbors.get(nextId) ?? new Set<string>())]
        .map((neighbor) => assigned.get(neighbor))
        .filter((color): color is number => color !== undefined),
    )
    let colorIndex = 0
    if (usedGlobally.size < REGION_COLOR_PALETTE.length) {
      while (usedGlobally.has(colorIndex)) colorIndex += 1
    } else {
      while (usedColors.has(colorIndex)) colorIndex += 1
    }
    assigned.set(nextId, colorIndex)
    usedGlobally.add(colorIndex)
    remaining.delete(nextId)
  }

  return Object.fromEntries(
    entries.map(({ id }) => [id, getExpandedColor(assigned.get(id) ?? 0)]),
  )
}

export function getRegionColor(id: string, colorMap?: RegionColorMap) {
  return colorMap?.[id] ?? getFallbackColor(id)
}

export function getRegionColorExpression(
  colorMap: RegionColorMap | null | undefined,
): ExpressionSpecification {
  const expression: unknown[] = ["match", ["get", "id"]]
  Object.entries(colorMap ?? {})
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([id, color]) => expression.push(id, color))
  expression.push("#B9D3CA")
  return expression as ExpressionSpecification
}
