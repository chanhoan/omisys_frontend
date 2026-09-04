// 백엔드 주문 상태값은 두 계열이 섞여 있다(PENDING/PAID/... 와 PENDING_PAYMENT/COMPLETED/...).
// 시안의 6개 필터와 5개 배지에 맞추려면 양쪽을 같은 그룹으로 접어야 한다.
export type OrderGroup = 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled'

const GROUPS: Record<OrderGroup, readonly string[]> = {
  pending: ['PENDING', 'PENDING_PAYMENT', 'WAITING'],
  paid: ['PAID', 'COMPLETED'],
  shipping: ['SHIPPING', 'PREPARING', 'READY_FOR_SHIPMENT', 'IN_TRANSIT'],
  delivered: ['DELIVERED'],
  cancelled: ['CANCELLED', 'CANCELED', 'REFUNDED', 'FAILED'],
}

export const ORDER_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '결제 대기' },
  { key: 'paid', label: '결제 완료' },
  { key: 'shipping', label: '배송 중' },
  { key: 'delivered', label: '배송 완료' },
  { key: 'cancelled', label: '취소·환불' },
] as const

const LABELS: Record<OrderGroup, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  shipping: '배송 중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
}

export function orderGroup(state: string): OrderGroup | null {
  const upper = state.toUpperCase()
  for (const [group, states] of Object.entries(GROUPS) as [OrderGroup, readonly string[]][]) {
    if (states.includes(upper)) return group
  }
  return null
}

export function orderStateLabel(state: string): string {
  const group = orderGroup(state)
  return group ? LABELS[group] : state
}

export function orderBadgeClass(state: string): string {
  const group = orderGroup(state)
  return `status-badge status-${group ?? state.toLowerCase()}`
}
