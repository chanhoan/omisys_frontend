'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useToast } from './toast'

const CANCELLABLE = new Set(['PENDING_PAYMENT', 'COMPLETED', 'READY_FOR_SHIPMENT'])

export function OrderActions({ orderId, orderState }: { orderId: number; orderState: string }) {
  const router = useRouter()
  const { show } = useToast()
  const [pending, setPending] = useState(false)

  if (!CANCELLABLE.has(orderState)) return null

  // 고객 경로는 취소만 노출한다. `DELETE /api/orders/{orderId}` 도 존재하지만, 주문을 지우면
  // 취소 이력이 사라져 배송·정산 추적이 끊긴다. 삭제는 관리자 기능으로 남긴다.
  async function handleCancel() {
    setPending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? '주문을 취소하지 못했습니다.')
      show('주문이 취소되었습니다.')
      router.refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : '주문을 취소하지 못했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <button className="button" disabled={pending} onClick={handleCancel} type="button">
      {pending ? '취소 중…' : '주문 취소'}
    </button>
  )
}
