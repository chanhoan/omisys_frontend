'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ConfirmDialog } from './confirm-dialog'
import { Sentences } from './sentences'
import { useToast } from './toast'

const CANCELLABLE = new Set(['PENDING', 'PENDING_PAYMENT', 'PAID', 'COMPLETED', 'READY_FOR_SHIPMENT'])

interface OrderActionsProps { orderId: number; orderNo?: string | null; orderState: string }

export function OrderActions({ orderId, orderNo, orderState }: OrderActionsProps) {
  const router = useRouter()
  const { show } = useToast()
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  if (!CANCELLABLE.has(orderState.toUpperCase())) return null

  // 고객 경로는 취소만 노출한다. `DELETE /api/orders/{orderId}` 도 존재하지만, 주문을 지우면
  // 취소 이력이 사라져 배송·정산 추적이 끊긴다. 삭제는 관리자 기능으로 남긴다.
  async function handleCancel() {
    setPending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PATCH' })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? '주문을 취소하지 못했습니다.')
      show('주문이 취소되었습니다.')
      setConfirming(false)
      router.refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : '주문을 취소하지 못했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <button className="button ghost" disabled={pending} onClick={() => setConfirming(true)} type="button">주문 취소</button>
      <ConfirmDialog
        cancelLabel="닫기"
        confirmLabel="주문 취소"
        description={<Sentences sentences={[
          `#${orderNo ?? orderId} 주문이 취소되고 재고가 복구됩니다.`,
          '사용한 쿠폰과 포인트는 함께 반환됩니다.',
          '취소한 주문은 되돌릴 수 없습니다.',
        ]} />}
        destructive
        onCancel={() => { if (!pending) setConfirming(false) }}
        onConfirm={handleCancel}
        open={confirming}
        pending={pending}
        title="주문을 취소할까요?"
      />
    </>
  )
}
