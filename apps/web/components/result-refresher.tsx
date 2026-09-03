'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** 결제창에서 돌아온 직후 주문이 아직 서버에 반영되지 않았을 때, 잠시 뒤 한 번 더 조회한다. */
export function ResultRefresher({ delayMs = 3000 }: { delayMs?: number }) {
  const router = useRouter()
  useEffect(() => {
    const timer = setTimeout(() => router.refresh(), delayMs)
    return () => clearTimeout(timer)
  }, [router, delayMs])
  return null
}
