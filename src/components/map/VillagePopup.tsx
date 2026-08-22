"use client"

import { Popup } from "react-map-gl/maplibre"
import { formatNullableNumber } from "@/lib/format"
import type { VillageStatistic } from "@/types/village"
import type { MasterIndikator } from "@/types/database"

interface VillagePopupProps {
  longitude: number
  latitude: number
  name: string
  village: VillageStatistic | undefined
  indicators: MasterIndikator[]
}

export function VillagePopup({
  longitude,
  latitude,
  name,
  village,
  indicators,
}: VillagePopupProps) {
  // Filter indicators to only those with a valid value
  const validIndicators = indicators.filter(ind => {
    const val = village?.monografiData?.[ind.id];
    return val !== undefined && val !== null;
  });

  const displayIndicators = validIndicators.slice(0, 4);

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
        <strong className="popup-title font-semibold">{name}</strong>
        <div className="popup-stat-grid" aria-label={`Statistik ${name}`}>
          {displayIndicators.length > 0 ? (
            displayIndicators.map((ind) => {
              const val = village?.monografiData?.[ind.id] ?? null;
              return (
                <div key={ind.id} className="popup-stat">
                  <span className="popup-stat-label">
                    {ind.nama_indikator}
                  </span>
                  <strong className="font-medium">
                    <span className="truncate">{formatNullableNumber(val)}</span>
                    {ind.satuan && (
                      <span className="text-[0.6em] font-normal opacity-70 tracking-normal translate-y-[-0.5px]">
                        {ind.satuan}
                      </span>
                    )}
                  </strong>
                </div>
              );
            })
          ) : (
            <div className="popup-stat">
              <span className="popup-stat-label">Belum ada indikator aktif</span>
            </div>
          )}
        </div>
      </div>
    </Popup>
  )
}
