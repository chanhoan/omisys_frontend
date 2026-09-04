import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReviewActions } from './review-actions'
import { ToastProvider } from './toast'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
const OWN_REVIEW = { reviewId: 7, userId: 1, rating: 4, content: 'Nice' }
const renderActions = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>)
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
// 목록의 삭제 버튼과 다이얼로그의 삭제 버튼이 같은 라벨이라 순서로 구분한다.
const confirmDeleteButton = () => screen.getAllByRole('button', { name: '삭제' })[1]

describe('ReviewActions', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn(async () => response({ message: null }))))
  afterEach(() => { cleanup(); vi.unstubAllGlobals() })

  it('hides actions for an anonymous or another viewer', () => {
    const { rerender } = renderActions(<ReviewActions review={OWN_REVIEW} />)
    expect(screen.queryByRole('button', { name: '삭제' })).toBeNull()
    rerender(<ToastProvider><ReviewActions review={OWN_REVIEW} viewerId={2} /></ToastProvider>)
    expect(screen.queryByRole('button', { name: '수정' })).toBeNull()
  })

  it('requires dialog confirmation before deleting', async () => {
    renderActions(<ReviewActions review={OWN_REVIEW} viewerId={1} />)
    fireEvent.click(screen.getByRole('button', { name: '삭제' }))
    expect(screen.getByRole('dialog')).toBeVisible()
    expect(fetch).not.toHaveBeenCalled()
    fireEvent.click(confirmDeleteButton())
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/reviews/7', { method: 'DELETE' }))
  })

  it('keeps the dialog open and surfaces delete failures as a toast', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({ message: 'Cannot delete' }, 403)))
    renderActions(<ReviewActions review={OWN_REVIEW} viewerId={1} />)
    fireEvent.click(screen.getByRole('button', { name: '삭제' }))
    fireEvent.click(confirmDeleteButton())
    expect(await screen.findByText('Cannot delete')).toBeVisible()
    expect(screen.getByRole('dialog')).toBeVisible()
  })
})
