"use client"

import { ChevronRight, List, MapPin } from "lucide-react"
import { formatNullableNumber } from "@/lib/format"
import type { VillageStatistic } from "@/types/village"

interface VillageListProps {
  villages: readonly VillageStatistic[]
  unitLabel: string
  unitLabelPlural: string
  selectedVillageId: string | null
  isOpen: boolean
  onToggle: () => void
  onSelectVillage: (id: string) => void
}

export function VillageList({
  villages,
  unitLabel,
  unitLabelPlural,
  selectedVillageId,
  isOpen,
  onToggle,
  onSelectVillage,
}: VillageListProps) {
  return (
    <div className="village-list-control">
      <button
        type="button"
        className={`toolbar-button${isOpen ? " is-active" : ""}`}
        aria-expanded={isOpen}
        aria-controls="village-list-menu"
        onClick={onToggle}
      >
        <List size={16} strokeWidth={2.1} aria-hidden="true" />
        <span>Daftar {unitLabelPlural.toLocaleLowerCase("id-ID")}</span>
      </button>
      {isOpen && (
        <div
          id="village-list-menu"
          className="village-list-menu"
          role="menu"
          aria-label={`Daftar ${unitLabelPlural.toLocaleLowerCase("id-ID")}`}
        >
          <div className="village-list-heading">
            <span>Wilayah {unitLabel.toLocaleLowerCase("id-ID")}</span>
            <small>{villages.length} wilayah</small>
          </div>
          <div className="village-list-items">
            {villages.map((village) => (
              <button
                type="button"
                role="menuitem"
                key={village.id}
                className={`village-list-item${
                  selectedVillageId === village.id ? " is-selected" : ""
                }`}
                onClick={() => onSelectVillage(village.id)}
              >
                <span className="village-list-icon" aria-hidden="true">
                  <MapPin size={15} strokeWidth={2} />
                </span>
                <span className="village-list-name">
                  <strong>{village.name}</strong>
                  <small>{formatNullableNumber(village.population, " jiwa")}</small>
                </span>
                <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
