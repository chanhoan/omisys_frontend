'use client'

import { queueApiResponseSchema, type QueueResponse } from '@omi/api'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CloseIcon, SoldOutIcon } from './icons'
import { claimQueuedIntent, getQueuedIntent, type QueueIntent } from './queue-intent-store'
import { Sentences } from './sentences'
import { useToast } from './toast'

type QueueView =
  | { kind: 'checking' }
  | { kind: 'waiting'; rank: number; retryAfterSeconds: number }
  | { kind: 'replaying' }
  | { kind: 'expired' }
  | { kind: 'missing-intent' }
  | { kind: 'result'; ok: boolean; message: string }
  | { kind: 'error'; message: string }

const DIAL_CIRCUMFERENCE = 339.3
const NEAR_FRONT_RANK = 10

const waitSentences = ['동시 접속이 많아 순서대로 입장하고 있습니다.', '이 화면을 유지하면 자동으로 입장됩니다.'] as const
const nearSentences = ['곧 입장합니다.', '결제 정보를 미리 준비해두시면 더 빠르게 주문할 수 있습니다.'] as const
const waitHintSentences = ['창을 닫으면 순번이 사라집니다.', '새로고침해도 순번은 유지됩니다.'] as const
const expiredSentences = ['일정 시간 응답이 없어 순번이 해제되었습니다.', '다시 시도하면 새 순번을 받습니다.'] as const
const soldoutSentences = ['대기 중 재고가 마감되었습니다.', '재입고 알림을 신청하시면 다음 입고 시 먼저 안내합니다.'] as const

function retrySeconds(response: Response, data: QueueResponse): number {
  if (data.state !== 'WAITING') return 0
  const fromHeader = Number(response.headers.get('Retry-After'))
  return Number.isInteger(fromHeader) && fromHeader > 0
    ? Math.max(fromHeader, data.retryAfterSeconds)
    : data.retryAfterSeconds
}

async function readQueueStatus(): Promise<{ response: Response; data: QueueResponse }> {
  const response = await fetch('/api/queue/status', { headers: { Accept: 'application/json' } })
  const payload: unknown = await response.json().catch(() => null)
  const parsed = queueApiResponseSchema.safeParse(payload)
  if (!parsed.success) throw new Error('대기열 응답을 확인할 수 없습니다. 다시 시도해주세요.')

  const { data } = parsed.data
  const expectedStatus = data.state === 'WAITING' ? 202 : data.state === 'READY' ? 200 : 410
  if (response.status !== expectedStatus) throw new Error('대기열 응답 상태가 일치하지 않습니다.')
  return { response, data }
}

function messageFromDownstream(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const { message } = payload as { message?: unknown }
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

async function replay(intent: QueueIntent): Promise<{ ok: boolean; message: string }> {
  const headers = new Headers({ 'Idempotency-Key': intent.idempotencyKey })
  if (intent.body !== undefined) headers.set('Content-Type', intent.contentType ?? 'application/json')

  const response = await fetch(intent.url, { method: intent.method, headers, body: intent.body })
  const payload: unknown = await response.json().catch(() => null)
  return {
    ok: response.ok,
    message: messageFromDownstream(payload, response.ok ? '요청이 완료되었습니다.' : '요청을 완료하지 못했습니다.'),
  }
}

function waitEstimate(rank: number): string {
  if (rank <= NEAR_FRONT_RANK) return '10초 이내'
  if (rank < 60) return `약 ${rank}초`
  return `약 ${Math.ceil(rank / 60)}분`
}

export function QueueClient({ returnHref = '/shop' }: { returnHref?: string }) {
  const { show } = useToast()
  const [view, setView] = useState<QueueView>(() => getQueuedIntent() ? { kind: 'checking' } : { kind: 'missing-intent' })
  const [countdown, setCountdown] = useState(0)
  const [initialRank, setInitialRank] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)

  const poll = useCallback(async () => {
    try {
      const { response, data } = await readQueueStatus()
      if (cancelledRef.current) return

      if (data.state === 'WAITING') {
        const seconds = retrySeconds(response, data)
        setInitialRank((current) => current ?? data.rank)
        setView({ kind: 'waiting', rank: data.rank, retryAfterSeconds: seconds })
        setCountdown(seconds)
        timerRef.current = setTimeout(() => { void poll() }, seconds * 1000)
        return
      }

      if (data.state === 'EXPIRED') {
        setView({ kind: 'expired' })
        return
      }

      const intent = claimQueuedIntent()
      if (!intent) {
        setView({ kind: 'missing-intent' })
        return
      }

      setView({ kind: 'replaying' })
      const result = await replay(intent)
      if (!cancelledRef.current) setView({ kind: 'result', ...result })
    } catch (error) {
      if (!cancelledRef.current) {
        setView({ kind: 'error', message: error instanceof Error ? error.message : '대기열 상태를 확인하지 못했습니다.' })
      }
    }
  }, [])

  useEffect(() => {
    if (!getQueuedIntent()) return
    cancelledRef.current = false
    void poll()
    return () => {
      cancelledRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [poll])

  const waitingRank = view.kind === 'waiting' ? view.rank : 0

  useEffect(() => {
    if (view.kind !== 'waiting') return
    const ticker = setInterval(() => setCountdown((value) => (value > 0 ? value - 1 : 0)), 1000)
    return () => clearInterval(ticker)
  }, [view.kind, waitingRank])

  function retryQueue() {
    setInitialRank(null)
    setView({ kind: 'checking' })
    void poll()
  }

  if (view.kind === 'waiting') {
    const startRank = initialRank ?? view.rank
    const progress = startRank > 0 ? Math.min(0.98, Math.max(0, (startRank - view.rank) / startRank)) : 0
    const nearFront = view.rank <= NEAR_FRONT_RANK

    return (
      <section aria-live="polite" className="queue-page">
        <p className="eyebrow">DROP 04 · 접속 대기</p>
        <div className="queue-dial" aria-label={`대기 순번 ${view.rank}번`}>
          <svg aria-hidden="true" viewBox="0 0 120 120">
            <circle className="track" cx="60" cy="60" r="54" />
            <circle className="bar" cx="60" cy="60" r="54" strokeDasharray={DIAL_CIRCUMFERENCE} strokeDashoffset={DIAL_CIRCUMFERENCE * (1 - progress)} />
          </svg>
          <b>{view.rank}<small>내 순번</small></b>
        </div>
        <h1>{nearFront ? '거의 다 왔습니다' : '접속을 기다리고 있습니다'}</h1>
        <p><Sentences sentences={nearFront ? nearSentences : waitSentences} /></p>
        <div className="queue-meta">
          <span className="queue-chip">앞에 <b>{view.rank}</b>명</span>
          <span className="queue-chip">예상 <b>{waitEstimate(view.rank)}</b></span>
          <span className="queue-chip"><b>{countdown}</b>초 후 재확인</span>
        </div>
        <div className="queue-bar" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></div>
        {nearFront
          ? <p className="queue-hint">입장하면 자동으로 주문 화면으로 이동합니다.</p>
          : <p className="queue-hint"><Sentences sentences={waitHintSentences} /></p>}
      </section>
    )
  }

  if (view.kind === 'expired' || view.kind === 'missing-intent' || view.kind === 'error') {
    return (
      <section aria-live="polite" className="queue-page">
        <p className="eyebrow">DROP 04</p>
        <div className="result-mark is-fail" style={{ marginBottom: 20 }}><CloseIcon /></div>
        <h1>{view.kind === 'error' ? '대기열 상태를 확인하지 못했습니다' : '대기 순번이 만료되었습니다'}</h1>
        {view.kind === 'error'
          ? <p role="alert">{view.message}</p>
          : <p><Sentences sentences={expiredSentences} /></p>}
        <div className="result-actions">
          <button className="button dark" onClick={retryQueue} type="button">다시 대기하기</button>
          <Link className="button ghost" href={returnHref}>스토어로</Link>
        </div>
      </section>
    )
  }

  if (view.kind === 'result' && !view.ok) {
    return (
      <section aria-live="polite" className="queue-page">
        <p className="eyebrow">DROP 04</p>
        <div className="state-icon" style={{ width: 64, height: 64, margin: '0 auto 20px' }}><SoldOutIcon /></div>
        <h1>준비된 수량이 모두 소진되었습니다</h1>
        <p><Sentences sentences={soldoutSentences} /></p>
        <p className="queue-hint">{view.message}</p>
        <div className="result-actions">
          <button className="button dark" onClick={() => show('재입고 알림은 준비 중입니다.')} type="button">재입고 알림 신청</button>
          <Link className="button ghost" href={returnHref}>다른 제품 보기</Link>
        </div>
      </section>
    )
  }

  if (view.kind === 'result') {
    return (
      <section aria-live="polite" className="queue-page">
        <p className="eyebrow">DROP 04</p>
        <h1>요청이 완료되었습니다</h1>
        <p>{view.message}</p>
        <div className="result-actions">
          <Link className="button dark" href="/account/orders">주문 내역 보기</Link>
          <Link className="button ghost" href={returnHref}>계속 쇼핑하기</Link>
        </div>
      </section>
    )
  }

  return (
    <section aria-live="polite" className="queue-page">
      <p className="eyebrow">DROP 04 · 접속 대기</p>
      <div className="app-spinner" style={{ margin: '0 auto 22px' }} />
      <h1>{view.kind === 'replaying' ? '주문을 처리하고 있습니다' : '순번을 확인하고 있습니다'}</h1>
      <p className="queue-hint">{view.kind === 'replaying' ? '이 화면을 닫지 말아주세요.' : '잠시만 기다려주세요.'}</p>
    </section>
  )
}
