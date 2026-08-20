export type NullableStatistic = number | null

export interface EducationStatistic {
  elementary: NullableStatistic
  juniorHigh: NullableStatistic
  seniorHigh: NullableStatistic
  university: NullableStatistic
}

export interface EconomyStatistic {
  umkm: NullableStatistic
  agriculture: NullableStatistic
  industry: NullableStatistic
}

export interface InfrastructureStatistic {
  schools: NullableStatistic
  healthFacilities: NullableStatistic
  worshipPlaces: NullableStatistic
}

export interface VillageStatistic {
  id: string
  slug: string
  name: string
  districtName: string
  population: NullableStatistic
  areaKm2: NullableStatistic
  households: NullableStatistic
  students?: NullableStatistic
  malePopulation?: NullableStatistic
  femalePopulation?: NullableStatistic
  education?: EducationStatistic
  economy?: EconomyStatistic
  infrastructure?: InfrastructureStatistic
  dataStatus: "illustrative" | "official"
  dataYear?: number
  sourceLabel?: string
}
