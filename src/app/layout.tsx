import type { Metadata } from "next"
import "maplibre-gl/dist/maplibre-gl.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "Monografi Kecamatan Bandongan",
  description:
    "Infografis Monografi Kecamatan Bandongan",
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
