import '@testing-library/jest-dom/vitest'

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DaumPostcodeCtor } from './use-daum-postcode'

const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
const SCRIPT_SELECTOR = `script[src="${SCRIPT_SRC}"]`

const PostcodeStub = class {
  embed() {}
  open() {}
} as unknown as DaumPostcodeCtor

function injectedScript(): HTMLScriptElement {
  const script = document.querySelector<HTMLScriptElement>(SCRIPT_SELECTOR)
  if (!script) throw new Error('postcode script was not injected')
  return script
}

async function importModule() {
  return import('./use-daum-postcode')
}

describe('loadDaumPostcode', () => {
  beforeEach(() => {
    vi.resetModules()
    document.querySelectorAll(SCRIPT_SELECTOR).forEach((node) => node.remove())
    delete window.daum
  })

  afterEach(() => {
    cleanup()
  })

  it('injects the script once and resolves with the widget constructor', async () => {
    const { loadDaumPostcode } = await importModule()

    const first = loadDaumPostcode()
    const second = loadDaumPostcode()
    window.daum = { Postcode: PostcodeStub }
    injectedScript().dispatchEvent(new Event('load'))

    await expect(first).resolves.toBe(PostcodeStub)
    await expect(second).resolves.toBe(PostcodeStub)
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1)
  })

  it('resolves immediately when the widget is already on the page', async () => {
    const { loadDaumPostcode } = await importModule()
    window.daum = { Postcode: PostcodeStub }

    await expect(loadDaumPostcode()).resolves.toBe(PostcodeStub)
    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull()
  })

  // 프로덕션에는 죽은 <script> 를 치우는 단계가 없다. 실패한 태그를 그대로 두고 재시도해야
  // 실제 복구 경로를 검증할 수 있다.
  it('rejects when the script fails and allows a retry afterwards', async () => {
    const { loadDaumPostcode } = await importModule()

    const failing = loadDaumPostcode()
    injectedScript().dispatchEvent(new Event('error'))
    await expect(failing).rejects.toThrow('주소 검색 서비스를 불러오지 못했습니다.')

    const retried = loadDaumPostcode()
    window.daum = { Postcode: PostcodeStub }
    injectedScript().dispatchEvent(new Event('load'))
    await expect(retried).resolves.toBe(PostcodeStub)
  })

  it('drops the dead script element so the retry injects a fresh one', async () => {
    const { loadDaumPostcode } = await importModule()

    const failing = loadDaumPostcode()
    const dead = injectedScript()
    dead.dispatchEvent(new Event('error'))
    await expect(failing).rejects.toThrow('주소 검색 서비스를 불러오지 못했습니다.')

    expect(document.querySelector(SCRIPT_SELECTOR)).toBeNull()
    void loadDaumPostcode()
    expect(injectedScript()).not.toBe(dead)
  })

  it('reuses a script tag that another caller already added', async () => {
    const { loadDaumPostcode } = await importModule()
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    document.head.append(script)

    const promise = loadDaumPostcode()
    window.daum = { Postcode: PostcodeStub }
    script.dispatchEvent(new Event('load'))

    await expect(promise).resolves.toBe(PostcodeStub)
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1)
  })

  it('rejects when the script loads without exposing the widget', async () => {
    const { loadDaumPostcode } = await importModule()

    const promise = loadDaumPostcode()
    injectedScript().dispatchEvent(new Event('load'))

    await expect(promise).rejects.toThrow('주소 검색 서비스를 불러오지 못했습니다.')
  })
})

describe('useDaumPostcode', () => {
  beforeEach(() => {
    vi.resetModules()
    document.querySelectorAll(SCRIPT_SELECTOR).forEach((node) => node.remove())
    delete window.daum
  })

  afterEach(() => {
    cleanup()
  })

  async function renderProbe() {
    const { useDaumPostcode } = await importModule()

    function Probe() {
      const { error, load, ready } = useDaumPostcode()
      return (
        <div>
          <button onClick={() => { void load().catch(() => {}) }} type="button">불러오기</button>
          <span data-testid="ready">{String(ready)}</span>
          <span data-testid="error">{error?.message ?? ''}</span>
        </div>
      )
    }

    render(<Probe />)
  }

  it('reports ready once the widget script loads', async () => {
    await renderProbe()
    expect(screen.getByTestId('ready')).toHaveTextContent('false')

    fireEvent.click(screen.getByRole('button', { name: '불러오기' }))
    await act(async () => {
      window.daum = { Postcode: PostcodeStub }
      injectedScript().dispatchEvent(new Event('load'))
    })

    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
    expect(screen.getByTestId('error')).toHaveTextContent('')
  })

  it('surfaces a load failure through error', async () => {
    await renderProbe()

    fireEvent.click(screen.getByRole('button', { name: '불러오기' }))
    await act(async () => {
      injectedScript().dispatchEvent(new Event('error'))
    })

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('주소 검색 서비스를 불러오지 못했습니다.'))
    expect(screen.getByTestId('ready')).toHaveTextContent('false')
  })
})
