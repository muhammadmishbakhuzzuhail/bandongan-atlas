import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Point,
  Polygon,
  Position,
} from "geojson"

export type VillageGeometry = Polygon | MultiPolygon | null

export type MapDisplayMode = "overlay" | "satellite"

export interface VillageGeoJsonProperties {
  id?: string | number
  name?: string
  slug?: string
  role?: "focus" | "context" | "neighbor" | "city-context"
  labelCoordinates?: [number, number]
  label_coordinates?: [number, number]
  labelLon?: number
  labelLat?: number
  label_lon?: number
  label_lat?: number
  [key: string]: unknown
}

export type VillageFeature = Feature<
  VillageGeometry,
  VillageGeoJsonProperties
> & {
  id?: string | number
}

export interface VillageFeatureCollection {
  type: "FeatureCollection"
  features: VillageFeature[]
}

export type VillageLabelFeature = Feature<
  Point,
  { id: string; name: string }
>

export type VillageLabelCollection = FeatureCollection<
  Point,
  { id: string; name: string }
>

export type GeoBounds = [number, number, number, number]

export type Coordinate = [number, number]

export type { Position }
