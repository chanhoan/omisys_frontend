// 홈의 "이어서 보기" 레일이 쓰는 최근 본 상품 목록. 서버 계약에 조회 이력 엔드포인트가 없어
// 브라우저에만 보관한다 (queue-intent-store 와 같은 방식).
const STORAGE_KEY = 'omi.recently-viewed'
const MAX_ITEMS = 12
const EMPTY = '[]'

const listeners = new Set<() => void>()

export function rememberViewedProduct(productId: string): void {
  if (typeof window === 'undefined') return
  try {
    const next = [productId, ...parseViewedProducts(readViewedProductsRaw()).filter((id) => id !== productId)].slice(0, MAX_ITEMS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // 프라이빗 모드 등 저장이 막힌 환경에서는 조용히 건너뛴다.
  }
  for (const listener of listeners) listener()
}

/** useSyncExternalStore 스냅샷용 — 동일 입력에 동일 문자열을 돌려줘야 하므로 파싱하지 않는다. */
export function readViewedProductsRaw(): string {
  if (typeof window === 'undefined') return EMPTY
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY
  } catch {
    return EMPTY
  }
}

export function readServerViewedProductsRaw(): string {
  return EMPTY
}

export function subscribeViewedProducts(listener: () => void): () => void {
  listeners.add(listener)
  if (typeof window !== 'undefined') window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') window.removeEventListener('storage', listener)
  }
}

export function parseViewedProducts(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}
