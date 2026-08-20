import type { VillageStatistic } from "@/types/village"

export function getStudentCount(village: VillageStatistic) {
  // Educational attainment is not the same measure as current enrolled students.
  // Keep the value unknown until an official student-count field is available.
  return typeof village.students === "number" ? village.students : null
}
