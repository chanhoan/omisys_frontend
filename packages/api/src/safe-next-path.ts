export function safeNextPath(value: string | null | undefined, fallback = '/account'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
