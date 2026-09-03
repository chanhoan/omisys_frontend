'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}
const isClient = () => true
const isServer = () => false
const pad = (value: number) => String(value).padStart(2, '0')

function parts(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
  }
}

/** 시안(사전예약 - 오픈 예정)의 일/시간/분 카운트다운. */
export function PreorderCountdown({ startAt }: { startAt: string }) {
  // 서버 렌더에서는 남은 시간을 계산할 수 없으므로 클라이언트에서만 그린다.
  const mounted = useSyncExternalStore(noopSubscribe, isClient, isServer)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const target = new Date(startAt).getTime()
  if (!mounted || Number.isNaN(target)) return null
  const { days, hours, minutes } = parts(target - now)

  return (
    <div aria-label="오픈까지 남은 시간" className="preorder-countdown">
      <div><b>{pad(days)}</b><span>일</span></div>
      <div><b>{pad(hours)}</b><span>시간</span></div>
      <div><b>{pad(minutes)}</b><span>분</span></div>
    </div>
  )
}
