'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

export interface DaumPostcodeData {
  zonecode: string
  roadAddress: string
  jibunAddress: string
  autoRoadAddress: string
  autoJibunAddress: string
  bname: string
  buildingName: string
  userSelectedType: 'R' | 'J'
  sido: string
  sigungu: string
}

export interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void
  onclose?: (state: string) => void
  width?: string | number
  height?: string | number
}

export interface DaumPostcodeInstance {
  embed: (element: HTMLElement) => void
  open: () => void
}

export type DaumPostcodeCtor = new (options: DaumPostcodeOptions) => DaumPostcodeInstance

declare global {
  interface Window {
    daum?: { Postcode: DaumPostcodeCtor }
  }
}

// 스크립트는 한 번만 주입한다. 실패한 Promise 는 버려서 다음 시도에 재주입할 수 있게 한다.
let pending: Promise<DaumPostcodeCtor> | null = null

export function loadDaumPostcode(): Promise<DaumPostcodeCtor> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('주소 검색은 브라우저에서만 사용할 수 있습니다.'))
  }
  if (window.daum?.Postcode) return Promise.resolve(window.daum.Postcode)
  if (pending) return pending

  pending = new Promise<DaumPostcodeCtor>((resolve, reject) => {
    // 다른 코드가 이미 넣어 둔 태그가 있으면 재사용하고, 없으면 새로 주입한다.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    const script = existing ?? document.createElement('script')

    const fail = () => {
      // 한 번 실패한 <script> 는 load/error 를 다시 발생시키지 않는다. 남겨 두면 다음 시도가
      // 이 죽은 태그를 붙들고 영원히 pending 으로 남으므로 지워서 재주입되게 한다.
      script.remove()
      reject(new Error('주소 검색 서비스를 불러오지 못했습니다.'))
    }
    const settle = () => {
      const ctor = window.daum?.Postcode
      if (ctor) resolve(ctor)
      else fail()
    }

    script.addEventListener('load', settle, { once: true })
    script.addEventListener('error', fail, { once: true })

    if (!existing) {
      script.src = SCRIPT_SRC
      script.async = true
      document.head.append(script)
    }
  })

  pending.catch(() => { pending = null })
  return pending
}

export interface UseDaumPostcodeResult {
  ready: boolean
  error: Error | null
  load: () => Promise<DaumPostcodeCtor>
}

export function useDaumPostcode(): UseDaumPostcodeResult {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const load = useCallback(async () => {
    setError(null)
    try {
      const ctor = await loadDaumPostcode()
      if (mountedRef.current) setReady(true)
      return ctor
    } catch (caught) {
      const failure = caught instanceof Error ? caught : new Error('주소 검색 서비스를 불러오지 못했습니다.')
      if (mountedRef.current) setError(failure)
      throw failure
    }
  }, [])

  return { ready, error, load }
}
