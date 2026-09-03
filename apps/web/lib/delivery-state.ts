// 배송 상태값을 시안의 3개 필터 · 3개 배지로 접는다.
export type DeliveryGroup = 'ready' | 'shipping' | 'delivered' | 'cancelled'

const GROUPS: Record<DeliveryGroup, readonly string[]> = {
  ready: ['READY_FOR_SHIPMENT', 'READY', 'PREPARING', 'WAITING'],
  shipping: ['SHIPPING', 'IN_TRANSIT'],
  delivered: ['DELIVERED', 'COMPLETED'],
  cancelled: ['CANCELED', 'CANCELLED', 'FAILED'],
}

export const DELIVERY_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'ready', label: '배송 준비' },
  { key: 'shipping', label: '배송 중' },
  { key: 'delivered', label: '배송 완료' },
] as const

const LABELS: Record<DeliveryGroup, string> = {
  ready: '배송 준비',
  shipping: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
}

export function deliveryGroup(state: string): DeliveryGroup | null {
  const upper = state.toUpperCase()
  for (const [group, states] of Object.entries(GROUPS) as [DeliveryGroup, readonly string[]][]) {
    if (states.includes(upper)) return group
  }
  return null
}

export function deliveryStateLabel(state: string): string {
  const group = deliveryGroup(state)
  return group ? LABELS[group] : state
}

export function deliveryBadgeClass(state: string): string {
  const group = deliveryGroup(state)
  return `status-badge status-${group ?? state.toLowerCase()}`
}
