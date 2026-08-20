"use client"

import { Minus, Plus, RotateCcw } from "lucide-react"

interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: MapControlsProps) {
  return (
    <div className="map-controls" aria-label="Kontrol peta">
      <button
        type="button"
        className="map-control-button"
        onClick={onZoomIn}
        aria-label="Perbesar peta"
        title="Perbesar peta"
      >
        <Plus size={17} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="map-control-button"
        onClick={onZoomOut}
        aria-label="Perkecil peta"
        title="Perkecil peta"
      >
        <Minus size={17} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <span className="map-control-divider" aria-hidden="true" />
      <button
        type="button"
        className="map-control-button map-control-reset"
        onClick={onReset}
        aria-label="Reset tampilan peta"
        title="Reset tampilan"
      >
        <RotateCcw size={16} strokeWidth={2.1} aria-hidden="true" />
        <span>Reset</span>
      </button>
    </div>
  )
}
