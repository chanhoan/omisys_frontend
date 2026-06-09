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
