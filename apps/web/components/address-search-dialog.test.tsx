import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AddressSearchDialog } from './address-search-dialog'
import type { DaumPostcodeData, DaumPostcodeOptions } from './use-daum-postcode'

const widget = vi.hoisted(() => {
  const state: { options: DaumPostcodeOptions | null; error: Error | null; ready: boolean } = {
    error: null,
    options: null,
    ready: true,
  }
  const embed = vi.fn()
  class PostcodeMock {
    embed = embed
    open = vi.fn()
    constructor(options: DaumPostcodeOptions) { state.options = options }
  }
  return { PostcodeMock, embed, state }
})

vi.mock('./use-daum-postcode', () => ({
  useDaumPostcode: () => ({
    error: widget.state.error,
    load: () => (widget.state.error
      ? Promise.reject(widget.state.error)
      : Promise.resolve(widget.PostcodeMock)),
    ready: widget.state.ready,
  }),
}))

const SAMPLE_DATA: DaumPostcodeData = {
  autoJibunAddress: '',
  autoRoadAddress: '',
  bname: '행당동',
  buildingName: '한양대',
  jibunAddress: '서울 성동구 행당동 1-1',
  roadAddress: '서울 성동구 왕십리로 222',
  sido: '서울',
  sigungu: '성동구',
  userSelectedType: 'R',
  zonecode: '01234',
}

describe('AddressSearchDialog', () => {
  const onClose = vi.fn()
  const onComplete = vi.fn()

  beforeEach(() => {
    onClose.mockClear()
    onComplete.mockClear()
    widget.embed.mockClear()
    widget.state.options = null
    widget.state.error = null
    widget.state.ready = true
  })

  afterEach(() => { cleanup() })

  function open() {
    render(<AddressSearchDialog onClose={onClose} onComplete={onComplete} open />)
  }

  it('renders nothing while closed and never loads the widget', () => {
    render(<AddressSearchDialog onClose={onClose} onComplete={onComplete} open={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(widget.embed).not.toHaveBeenCalled()
  })

  it('embeds the widget into the container when opened', async () => {
    open()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await waitFor(() => expect(widget.embed).toHaveBeenCalledTimes(1))
    expect(widget.embed.mock.calls[0][0]).toHaveClass('address-search-embed')
  })

  it('marks the container busy until the widget script reports ready', () => {
    widget.state.ready = false
    open()

    expect(document.querySelector('.address-search-embed')).toHaveAttribute('aria-busy', 'true')
  })

  it('forwards the selected address and then closes', async () => {
    open()
    await waitFor(() => expect(widget.state.options).not.toBeNull())

    widget.state.options?.oncomplete(SAMPLE_DATA)

    expect(onComplete).toHaveBeenCalledWith(SAMPLE_DATA)
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when the widget closes itself', async () => {
    open()
    await waitFor(() => expect(widget.state.options).not.toBeNull())

    widget.state.options?.onclose?.('FORCE_CLOSE')

    expect(onClose).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('closes on Escape but ignores other keys', () => {
    open()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Tab' })
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sits beside the form as a non-modal panel', () => {
    open()

    const panel = screen.getByRole('dialog')
    expect(panel).toHaveClass('address-search-panel')
    expect(panel).not.toHaveAttribute('aria-modal')
    expect(document.querySelector('.dialog-scrim')).toBeNull()
  })

  it('closes from the close button', () => {
    open()

    fireEvent.click(screen.getByRole('button', { name: '닫기' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows the load failure instead of the widget container', async () => {
    widget.state.error = new Error('주소 검색 서비스를 불러오지 못했습니다.')
    open()

    expect(await screen.findByRole('alert')).toHaveTextContent('주소 검색 서비스를 불러오지 못했습니다.')
    // 컨테이너는 숨기기만 한다 — 언마운트하면 재시도 때 ref 가 null 이라 위젯이 안 붙는다.
    expect(document.querySelector('.address-search-embed')).toHaveAttribute('hidden')
    expect(widget.embed).not.toHaveBeenCalled()
  })
})
