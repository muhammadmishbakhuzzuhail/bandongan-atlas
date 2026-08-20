import difference from "@turf/difference"
import union from "@turf/union"
import type { Feature, MultiPolygon, Polygon } from "geojson"
import type { VillageFeatureCollection } from "@/types/geo"

const WORLD_SOUTH = -85.051129
const WORLD_NORTH = 85.051129

function worldFeature(): Feature<Polygon> {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [-180, WORLD_SOUTH],
          [180, WORLD_SOUTH],
          [180, WORLD_NORTH],
          [-180, WORLD_NORTH],
          [-180, WORLD_SOUTH],
        ],
      ],
    },
  }
}

/** Creates a white inverse polygon without changing the source focus boundary. */
export function createOutsideFocusMask(
  focusBoundary: VillageFeatureCollection,
): VillageFeatureCollection | null {
  const focusFeatures: Feature<Polygon | MultiPolygon>[] = focusBoundary.features
    .filter((feature) => feature.geometry !== null)
    .map((feature) => ({
      type: "Feature",
      properties: {},
      geometry: feature.geometry as Polygon | MultiPolygon,
    }))

  if (!focusFeatures.length) return null

  const focus =
    focusFeatures.length === 1
      ? focusFeatures[0]
      : union({
          type: "FeatureCollection",
          features: focusFeatures,
        })
  if (!focus) return null

  const mask = difference({
    type: "FeatureCollection",
    features: [worldFeature(), focus],
  })
  if (!mask) return null

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "outside-focus-mask",
        properties: {
          id: "outside-focus-mask",
          name: "Outside focus mask",
        },
        geometry: mask.geometry,
      },
    ],
  }
}

export function isMaskReady(
  value: VillageFeatureCollection | null | undefined,
) {
  return Boolean(value?.features.some((feature) => feature.geometry))
}
