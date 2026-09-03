'use client'

import { queueApiResponseSchema } from '@omi/api'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { FormErrorBox } from './form-error-box'
import { rememberQueueIntent } from './queue-intent-store'
import { useToast } from './toast'

interface PreorderButtonProps {
  preOrderId: number
  state: 'open' | 'scheduled' | 'closed'
  addressId?: number
  authenticated: boolean
}

export function PreorderButton({ preOrderId, state, addressId, authenticated }: PreorderButtonProps) {
  const router = useRouter()
  const { show } = useToast()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const idempotencyKey = useRef<string | null>(null)

  async function handleOrder() {
    if (!authenticated) { router.push('/preorder?gate=1'); return }
    if (addressId === undefined) { router.push('/account/addresses'); return }
    setPending(true)
    setError(null)
    try {
      idempotencyKey.current ??= crypto.randomUUID()
      const url = `/api/preorders/${preOrderId}/order?addressId=${addressId}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
      })
      const payload: unknown = await response.json().catch(() => null)
      if (response.status === 202) {
        const queued = queueApiResponseSchema.safeParse(payload)
        if (!queued.success || queued.data.data.state !== 'WAITING') {
          throw new Error('대기열 상태를 확인하지 못했습니다. 다시 시도해 주세요.')
        }
        rememberQueueIntent({ method: 'POST', url, idempotencyKey: idempotencyKey.current })
        router.push('/queue')
        return
      }
      const result = payload as { message?: string } | null
      if (!response.ok) throw new Error(result?.message ?? '사전예약을 완료하지 못했습니다.')
      show('사전예약이 완료되었습니다.')
      idempotencyKey.current = null
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '사전예약을 완료하지 못했습니다.')
    } finally { setPending(false) }
  }

  if (state === 'scheduled') {
    return <button className="button ghost" onClick={() => show('오픈 알림은 준비 중입니다.')} type="button">오픈 알림 신청</button>
  }
  if (state === 'closed') {
    return <button className="button ghost" disabled type="button">마감됨</button>
  }

  return <>
    {error ? <FormErrorBox>{error}</FormErrorBox> : null}
    <button className="button dark" disabled={pending} onClick={handleOrder} type="button">{pending ? '예약 처리 중' : '예약하기'}</button>
  </>
}
