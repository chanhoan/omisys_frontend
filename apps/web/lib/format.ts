// 시안은 날짜를 2026.09.01, 시각을 2026.09.01 14:22 형태로 쓴다.
// Intl 로케일 출력(2026. 9. 1.)과 다르므로 화면용 포매터를 따로 둔다.
function parse(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const pad = (value: number) => String(value).padStart(2, '0')

export function formatDay(value: string | null | undefined): string {
  const date = parse(value)
  if (!date) return '-'
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

export function formatStamp(value: string | null | undefined): string {
  const date = parse(value)
  if (!date) return '-'
  return `${formatDay(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function daysUntil(value: string | number | null | undefined, now = new Date()): number | null {
  if (value == null) return null
  const raw = String(value)
  const normalized = /^\d{8}$/.test(raw) ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw
  const date = parse(normalized)
  if (!date) return null
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000)
}

export function formatCouponDate(value: string | number | null | undefined): string {
  if (value == null) return '-'
  const raw = String(value)
  const normalized = /^\d{8}$/.test(raw) ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw
  return formatDay(normalized)
}
