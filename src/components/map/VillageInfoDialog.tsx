"use client"

import { useEffect, useRef } from "react"
import {
  GraduationCap,
  HeartPulse,
  House,
  MapPinned,
  Ruler,
  School,
  Store,
  Users,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getVillageDisplayName, isFeatureGeometryReady } from "@/lib/geojson"
import { formatNullableArea, formatNullableNumber } from "@/lib/format"
import { getStudentCount } from "@/lib/village-stats"
import type { GeographicDataset } from "@/types/dataset"
import type { VillageFeature } from "@/types/geo"
import type { VillageStatistic } from "@/types/village"
import { Popup } from "react-map-gl/maplibre"

interface VillageInfoDialogProps {
  longitude: number
  latitude: number
  accentColor: string
  dataset: GeographicDataset
  village: VillageStatistic | undefined
  feature: VillageFeature | undefined
  onClose: () => void
}

function DialogStat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <div className="dialog-stat">
      <div className="dialog-stat-label">
        <Icon size={15} strokeWidth={1.9} aria-hidden="true" />
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </div>
  )
}

export function VillageInfoDialog({
  longitude,
  latitude,
  accentColor,
  dataset,
  village,
  feature,
  onClose,
}: VillageInfoDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const name = village?.name ?? getVillageDisplayName(feature)
  const hasGeometry = feature ? isFeatureGeometryReady(feature) : false
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
      anchor="left"
      offset={18}
      closeButton={false}
      closeOnClick={false}
      maxWidth="min(390px, calc(100vw - 24px))"
      className="village-info-popup"
    >
      <section
        className="infographic-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
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

        <div className="dialog-badges">
          <span className="dialog-badge dialog-badge-active">
            <MapPinned size={13} strokeWidth={2} aria-hidden="true" />
            {hasGeometry ? "Batas aktif" : "Geometry belum tersedia"}
          </span>
          {village?.dataStatus === "illustrative" && (
            <span className="dialog-badge">Data ilustratif</span>
          )}
          {village?.dataStatus === "official" && (
            <span className="dialog-badge">Baseline resmi</span>
          )}
        </div>

        {village ? (
          <>
            <div className="dialog-stat-grid">
              <DialogStat
                label="Penduduk"
                value={formatNullableNumber(village.population, " jiwa")}
                icon={Users}
              />
              <DialogStat
                label="Pelajar"
                value={formatNullableNumber(getStudentCount(village))}
                icon={GraduationCap}
              />
              <DialogStat
                label="Jumlah KK"
                value={formatNullableNumber(village.households)}
                icon={House}
              />
              <DialogStat
                label="Luas wilayah"
                value={formatNullableArea(village.areaKm2)}
                icon={Ruler}
              />
            </div>

            <div className="dialog-supporting" aria-label="Statistik tambahan">
              <span>
                <School size={14} aria-hidden="true" />
                Sekolah <strong>{formatNullableNumber(village.infrastructure?.schools)}</strong>
              </span>
              <span>
                <Store size={14} aria-hidden="true" />
                UMKM <strong>{formatNullableNumber(village.economy?.umkm)}</strong>
              </span>
              <span>
                <HeartPulse size={14} aria-hidden="true" />
                Kesehatan <strong>{formatNullableNumber(village.infrastructure?.healthFacilities)}</strong>
              </span>
            </div>

            {village.sourceLabel && (
              <p className="dialog-source">
                Sumber: {village.sourceLabel}
                {village.dataYear ? ` · Periode ${village.dataYear}` : ""}
              </p>
            )}
            <p className="dialog-disclaimer">{dataset.statisticsDisclaimer}</p>
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
    </Popup>
  )
}
