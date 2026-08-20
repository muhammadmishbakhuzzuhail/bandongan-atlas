const numberFormatter = new Intl.NumberFormat("id-ID")
const decimalFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatArea(value: number) {
  return `${decimalFormatter.format(value)} km²`
}

export function formatNullableNumber(
  value: number | null | undefined,
  suffix = "",
) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A"
  return `${formatNumber(value)}${suffix}`
}

export function formatNullableArea(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A"
  return formatArea(value)
}

export function formatPercent(value: number) {
  return `${decimalFormatter.format(value)}%`
}
