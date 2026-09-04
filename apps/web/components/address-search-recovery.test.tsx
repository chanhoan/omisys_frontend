import '@testing-library/jest-dom/vitest'

import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 이 파일은 use-daum-postcode 를 모킹하지 않는다. 스크립트 로딩 실패 → 재시도 경로는
// 훅의 실제 상태 전이와 스크립트 태그 수명이 얽혀 있어 모킹하면 재현되지 않는다.
const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
const SCRIPT_SELECTOR = `script[src="${SCRIPT_SRC}"]`

const embed = vi.fn()

function injectedScript(): HTMLScriptElement {
  const script = document.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR)
  if (!script) throw new Error('postcode script was not injected')
  return script
}

function installWidget() {
  window.daum = {
    Postcode: class {
      embed = embed
      open = vi.fn()
    } as never,
  }
}

describe('AddressSearchDialog recovery after a failed script load', () => {
  beforeEach(() => {
    vi.resetModules()
    embed.mockClear()
    document.querySelectorAll(SCRIPT_SELECTOR).forEach((node) => node.remove())
    delete window.daum
  })

  afterEach(() => { cleanup() })

  it('shows the failure, then embeds the widget when reopened', async () => {
    const { AddressSearchDialog } = await import('./address-search-dialog')
    const props = { onClose: vi.fn(), onComplete: vi.fn() }

    const { rerender } = render(<AddressSearchDialog {...props} open />)

    await act(async () => { injectedScript().dispatchEvent(new Event('error')) })
    expect(await screen.findByRole('alert')).toHaveTextContent('주소 검색 서비스를 불러오지 못했습니다.')

    rerender(<AddressSearchDialog {...props} open={false} />)
    rerender(<AddressSearchDialog {...props} open />)

    installWidget()
    await act(async () => { injectedScript().dispatchEvent(new Event('load')) })

    await waitFor(() => expect(embed).toHaveBeenCalledTimes(1))
    expect(embed.mock.calls[0][0]).toHaveClass('address-search-embed')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
