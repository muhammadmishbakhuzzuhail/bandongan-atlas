"use client"

import { Search, X } from "lucide-react"
import { useMemo, useState } from "react"
import type { VillageStatistic } from "@/types/village"

interface VillageSearchProps {
  villages: readonly VillageStatistic[]
  unitLabel: string
  onSelectVillage: (id: string) => void
}

export function VillageSearch({
  villages,
  unitLabel,
  onSelectVillage,
}: VillageSearchProps) {
  const [query, setQuery] = useState("")
  const unitLabelLower = unitLabel.toLocaleLowerCase("id-ID")
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
  const results = useMemo(
    () =>
      normalizedQuery
        ? villages
            .filter((village) =>
              village.name.toLocaleLowerCase("id-ID").includes(normalizedQuery),
            )
            .slice(0, 6)
        : [],
    [normalizedQuery, villages],
  )

  const handleSelect = (id: string) => {
    setQuery("")
    onSelectVillage(id)
  }

  return (
    <div className="search-control">
      <Search size={17} strokeWidth={2} aria-hidden="true" />
      <input
        type="search"
        value={query}
        placeholder={`Cari ${unitLabelLower}...`}
        aria-label={`Cari ${unitLabelLower}`}
        aria-autocomplete="list"
        aria-controls="village-search-results"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setQuery("")
          if (event.key === "Enter" && results[0]) {
            event.preventDefault()
            handleSelect(results[0].id)
          }
        }}
      />
      {query && (
        <button
          type="button"
          className="search-clear"
          aria-label="Hapus pencarian"
          title="Hapus pencarian"
          onClick={() => setQuery("")}
        >
          <X size={15} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}
      {normalizedQuery && (
        <div
          id="village-search-results"
          className="search-results"
          role="listbox"
          aria-label={`Hasil pencarian ${unitLabelLower}`}
        >
          {results.length ? (
            results.map((village) => (
              <button
                type="button"
                role="option"
                aria-selected="false"
                className="search-result"
                key={village.id}
                onClick={() => handleSelect(village.id)}
              >
                <span>
                  <strong>{village.name}</strong>
                  <small>{village.districtName}</small>
                </span>
                <span aria-hidden="true">↵</span>
              </button>
            ))
          ) : (
            <p className="search-empty">{unitLabel} tidak ditemukan.</p>
          )}
        </div>
      )}
    </div>
  )
}
