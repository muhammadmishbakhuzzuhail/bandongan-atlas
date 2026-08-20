"use client"

import { useCallback, useState, useSyncExternalStore } from "react"

export function useVillageSelection(availableIds: readonly string[] = []) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("popstate", onStoreChange)
    return () => window.removeEventListener("popstate", onStoreChange)
  }, [])

  const getUrlSelection = useCallback(() => {
    const queryId = new URLSearchParams(window.location.search).get("village")
    return queryId && availableIds.includes(queryId) ? queryId : null
  }, [availableIds])

  const urlSelection = useSyncExternalStore(subscribe, getUrlSelection, () => null)
  const [selectionOverride, setSelectionOverride] = useState<string | null | undefined>(
    undefined,
  )
  const selectedVillageId =
    selectionOverride === undefined ? urlSelection : selectionOverride

  const updateUrl = useCallback((id: string | null) => {
    const url = new URL(window.location.href)
    if (id) url.searchParams.set("village", id)
    else url.searchParams.delete("village")
    window.history.replaceState({}, "", url)
  }, [])

  const selectVillage = useCallback(
    (id: string) => {
      setSelectionOverride(id)
      updateUrl(id)
    },
    [updateUrl],
  )

  const clearSelection = useCallback(() => {
    setSelectionOverride(null)
    updateUrl(null)
  }, [updateUrl])

  return { selectedVillageId, selectVillage, clearSelection }
}
