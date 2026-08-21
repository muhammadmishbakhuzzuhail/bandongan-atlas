import type { Metadata } from "next"
import "maplibre-gl/dist/maplibre-gl.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Atlas Geography — Peta Batas & Statistik",
  description:
    "Infografis geografis interaktif untuk menguji boundary GeoJSON dan statistik wilayah.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
