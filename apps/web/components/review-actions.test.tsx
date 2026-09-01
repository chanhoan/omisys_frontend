import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReviewActions } from './review-actions'
import { ToastProvider } from './toast'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: () => {} }),
}))

const OWN_REVIEW = { reviewId: 7, userId: 1, rating: 4, content: '좋아요' }

function renderActions(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

function okResponse() {
  return new Response(JSON.stringify({ statusName: 'OK', message: null, data: null }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

describe('ReviewActions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => okResponse()))
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  afterEach(() => {
    // vitest 에 globals 가 꺼져 있어 RTL 자동 cleanup 이 걸리지 않는다. 직접 정리한다.
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows edit and delete on the viewer own review', () => {
    renderActions(<ReviewActions review={OWN_REVIEW} viewerId={1} />)

    expect(screen.getByRole('button', { name: '수정' })).toBeVisible()
    expect(screen.getByRole('button', { name: '삭제' })).toBeVisible()
  })

  it('hides the controls on someone else review', () => {
    renderActions(<ReviewActions review={OWN_REVIEW} viewerId={2} />)

    expect(screen.queryByRole('button', { name: '수정' })).toBeNull()
    expect(screen.queryByRole('button', { name: '삭제' })).toBeNull()
  })

  it('hides the controls when signed out', () => {
    renderActions(<ReviewActions review={OWN_REVIEW} />)

    expect(screen.queryByRole('button', { name: '삭제' })).toBeNull()
  })

  it('opens the edit form prefilled with the existing review', () => {
    renderActions(<ReviewActions review={OWN_REVIEW} viewerId={1} />)

    fireEvent.click(screen.getByRole('button', { name: '수정' }))

    expect(screen.getByRole('textbox')).toHaveValue('좋아요')
    expect(screen.getByRole('combobox')).toHaveValue('4')
  })

  it('sends a delete request once the viewer confirms', async () => {
    renderActions(<ReviewActions review={OWN_REVIEW} viewerId={1} />)

    fireEvent.click(screen.getByRole('button', { name: '삭제' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/reviews/7', { method: 'DELETE' })
    })
  })

  it('does not send anything when the viewer cancels', () => {
    vi.stubGlobal('confirm', vi.fn(() => false))
    renderActions(<ReviewActions review={OWN_REVIEW} viewerId={1} />)

    fireEvent.click(screen.getByRole('button', { name: '삭제' }))

    expect(fetch).not.toHaveBeenCalled()
  })
})
