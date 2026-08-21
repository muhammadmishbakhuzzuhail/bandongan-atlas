"use client"

import { GraduationCap, House, Ruler, Users } from "lucide-react"
import { Popup } from "react-map-gl/maplibre"
import { formatNullableArea, formatNullableNumber } from "@/lib/format"
import { getStudentCount } from "@/lib/village-stats"
import type { VillageStatistic } from "@/types/village"

interface VillagePopupProps {
  longitude: number
  latitude: number
  name: string
  village: VillageStatistic | undefined
}

export function VillagePopup({
  longitude,
  latitude,
  name,
  village,
}: VillagePopupProps) {
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      closeButton={false}
      closeOnClick={false}
      maxWidth="268px"
      offset={12}
      className="village-popup"
    >
      <div role="tooltip" className="popup-content">
        <strong className="popup-title">{name}</strong>
        <div className="popup-stat-grid" aria-label={`Statistik ${name}`}>
          <div className="popup-stat">
            <span className="popup-stat-label">
              <Users size={13} strokeWidth={2} aria-hidden="true" />
              Penduduk
            </span>
            <strong>{formatNullableNumber(village?.population)}</strong>
          </div>
          <div className="popup-stat">
            <span className="popup-stat-label">
              <GraduationCap size={13} strokeWidth={2} aria-hidden="true" />
              Pelajar
            </span>
            <strong>
              {formatNullableNumber(village ? getStudentCount(village) : null)}
            </strong>
          </div>
          <div className="popup-stat">
            <span className="popup-stat-label">
              <House size={13} strokeWidth={2} aria-hidden="true" />
              KK
            </span>
            <strong>{formatNullableNumber(village?.households)}</strong>
          </div>
          <div className="popup-stat">
            <span className="popup-stat-label">
              <Ruler size={13} strokeWidth={2} aria-hidden="true" />
              Luas
            </span>
            <strong>{formatNullableArea(village?.areaKm2)}</strong>
          </div>
        </div>
      </div>
    </Popup>
  )
}
