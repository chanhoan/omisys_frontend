'use client'

import { type KeyboardEvent, useEffect, useId, useRef } from 'react'

import { FormErrorBox } from './form-error-box'
import { type DaumPostcodeData, useDaumPostcode } from './use-daum-postcode'

export interface AddressSearchDialogProps {
  open: boolean
  onClose: () => void
  onComplete: (data: DaumPostcodeData) => void
}

export function AddressSearchDialog({ open, onClose, onComplete }: AddressSearchDialogProps) {
  const { error, load, ready } = useDaumPostcode()
  const containerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  // 위젯 콜백은 embed 시점의 클로저를 붙들기 때문에 최신 핸들러를 ref 로 참조한다.
  const handlersRef = useRef({ onClose, onComplete })

  useEffect(() => {
    handlersRef.current = { onClose, onComplete }
  }, [onClose, onComplete])

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    // 비모달 패널이라 조작 버튼으로 포커스를 옮기면 폼 작업 중 튀는 인상을 준다. 제목까지만 옮긴다.
    headingRef.current?.focus()

    return () => previousFocusRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    let cancelled = false
    // 컨테이너는 열려 있는 동안 계속 같은 노드다(에러 때도 hidden 으로 남긴다). cleanup 은 이 참조로 충분하다.
    const container = containerRef.current

    load()
      .then((Postcode) => {
        // 컨테이너는 이펙트 진입 시점이 아니라 여기서 읽는다. load() 가 error 를 지우면서
        // 컨테이너를 다시 렌더할 수 있어, 미리 캡처하면 낡은 null 을 붙들게 된다.
        const container = containerRef.current
        if (cancelled || !container) return
        // embed 는 컨테이너 재사용을 지원하지 않아 열 때마다 비우고 새 인스턴스를 붙인다.
        container.replaceChildren()
        new Postcode({
          height: '100%',
          onclose: () => handlersRef.current.onClose(),
          oncomplete: (data) => {
            handlersRef.current.onComplete(data)
            handlersRef.current.onClose()
          },
          width: '100%',
        }).embed(container)
      })
      .catch(() => { /* 실패는 useDaumPostcode 의 error 로 표시한다. */ })

    return () => {
      cancelled = true
      container?.replaceChildren()
    }
  }, [load, open])

  if (!open) return null

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') onClose()
  }

  // 배송지 폼 오른쪽에 나란히 서는 비모달 패널이라 aria-modal 을 쓰지 않는다.
  return (
    <section
      aria-labelledby={titleId}
      className="address-search-panel"
      onKeyDown={handleKeyDown}
      role="dialog"
    >
      <div className="address-search-header">
        <h2 id={titleId} ref={headingRef} tabIndex={-1}>주소 검색</h2>
        <button className="button ghost small" onClick={onClose} type="button">닫기</button>
      </div>
      {error ? <FormErrorBox>{error.message}</FormErrorBox> : null}
      {/* 에러일 때도 컨테이너를 DOM 에 남긴다. 언마운트하면 재시도 시 ref 가 null 인 채로
          이펙트가 돌아 위젯이 영영 붙지 않는다. */}
      <div aria-busy={!ready} className="address-search-embed" hidden={error !== null} ref={containerRef} />
    </section>
  )
}
