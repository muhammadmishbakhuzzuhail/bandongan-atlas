"use client"

import { Popup } from "react-map-gl/maplibre"

interface VillagePopupProps {
  longitude: number
  latitude: number
  name: string
}

export function VillagePopup({
  longitude,
  latitude,
  name,
}: VillagePopupProps) {
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom-left"
      closeButton={false}
      closeOnClick={false}
      offset={14}
      className="village-popup"
    >
      <div role="tooltip" className="popup-content">
        <strong>{name}</strong>
        <span>Klik untuk melihat informasi</span>
      </div>
    </Popup>
  )
}
