'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useToast } from './toast'

interface PreorderButtonProps {
  preOrderId: number
  open: boolean
  addressId?: number
}

export function PreorderButton({ preOrderId, open, addressId }: PreorderButtonProps) {
  const router = useRouter()
  const { show } = useToast()
  const [pending, setPending] = useState(false)

  if (!open) {
    return <button className="button dark" disabled type="button">Opening soon</button>
  }

  if (addressId === undefined) {
    return <a className="button dark" href="/account/addresses">배송지 추가 후 예약</a>
  }

  async function handleOrder() {
    setPending(true)
    try {
      const res = await fetch(`/api/preorders/${preOrderId}/order?addressId=${addressId}`, {
        method: 'POST',
      })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? '사전예약을 처리하지 못했습니다.')
      show('사전예약이 완료되었습니다.')
      router.refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : '사전예약을 처리하지 못했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <button className="button dark" disabled={pending} onClick={handleOrder} type="button">
      {pending ? '처리 중…' : 'Pre-order now'}
    </button>
  )
}
