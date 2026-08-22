"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { getVillageDisplayName } from "@/lib/geojson"
import { formatNullableNumber } from "@/lib/format"
import type { GeographicDataset } from "@/types/dataset"
import type { VillageFeature } from "@/types/geo"
import type { VillageStatistic } from "@/types/village"
import type { MasterIndikator } from "@/types/database"
import { Popup } from "react-map-gl/maplibre"

interface VillageInfoDialogProps {
  longitude: number
  latitude: number
  accentColor: string
  dataset: GeographicDataset
  village: VillageStatistic | undefined
  feature: VillageFeature | undefined
  indicators: MasterIndikator[]
  onClose: () => void
}

export function VillageInfoDialog({
  longitude,
  latitude,
  accentColor,
  dataset,
  village,
  feature,
  indicators,
  onClose,
}: VillageInfoDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const name = village?.name ?? getVillageDisplayName(feature)
  const titleId = `village-dialog-title-${village?.id ?? "unknown"}`

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [onClose])

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      offset={14}
      closeButton={false}
      closeOnClick={false}
      maxWidth="380px"
      className="village-info-popup"
    >
      <div
        className="village-info-dialog-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <section
          className="infographic-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dialog-header">
          <div className="dialog-heading">
            <span
              className="dialog-color-swatch"
              style={{ backgroundColor: accentColor }}
              aria-hidden="true"
            />
            <div>
              <p className="dialog-kicker">{dataset.unitLabel} terpilih</p>
              <h2 id={titleId}>{name}</h2>
              <p>{dataset.locationLabel}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="dialog-close-button"
            onClick={onClose}
            aria-label={`Tutup informasi ${name}`}
            title="Tutup dialog"
          >
            <X size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>



        {village ? (
          <>
            <div className="dialog-stat-grid">
              {indicators.filter(ind => {
                const val = village.monografiData?.[ind.id];
                return val !== undefined && val !== null;
              }).length > 0 ? (
                indicators.filter(ind => {
                  const val = village.monografiData?.[ind.id];
                  return val !== undefined && val !== null;
                }).map((ind) => {
                  const val = village.monografiData?.[ind.id] ?? null;
                  return (
                    <div key={ind.id} className="dialog-stat">
                      <div className="dialog-stat-label">
                        <span>{ind.nama_indikator}</span>
                      </div>
                      <strong className="font-semibold text-base text-[#173B39]">
                        <span className="truncate">{formatNullableNumber(val)}</span>
                        {ind.satuan && (
                          <span className="text-[0.6em] font-normal opacity-70 tracking-normal translate-y-[-1px] ml-1.5">
                            {ind.satuan}
                          </span>
                        )}
                      </strong>
                    </div>
                  );
                })
              ) : (
                <div className="dialog-stat">
                  <div className="dialog-stat-label">
                    <span>Belum ada indikator aktif</span>
                  </div>
                  <strong className="font-medium">-</strong>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="dialog-missing-state">
            <strong>Statistik belum tersedia</strong>
            <p>
              Polygon ditemukan, tetapi belum ada pasangan statistik untuk ID wilayah ini.
            </p>
          </div>
        )}
      </section>
      </div>
    </Popup>
  )
}
