import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReviewForm } from './review-form'
import { ToastProvider } from './toast'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
const EXISTING = { reviewId: 7, rating: 4, content: 'Existing review' }
const renderForm = (ui: ReactNode) => render(<ToastProvider>{ui}</ToastProvider>)
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('ReviewForm', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn(async () => response({ message: null }))))
  afterEach(() => { cleanup(); vi.unstubAllGlobals() })

  it('uses star buttons and exposes the controlled character count', () => {
    renderForm(<ReviewForm onDone={() => {}} review={EXISTING} />)
    fireEvent.click(screen.getByRole('button', { name: '2점' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Nice' } })
    expect(screen.getByRole('button', { name: '2점' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('4 / 1,000')).toBeVisible()
  })

  it('posts product/order ids and a valid payload', async () => {
    renderForm(<ReviewForm orderId={3} productId="p-1" />)
    fireEvent.click(screen.getByRole('button', { name: '리뷰 작성' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Nice' } })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(fetch).toHaveBeenCalledWith('/api/reviews', expect.objectContaining({ method: 'POST', body: JSON.stringify({ productId: 'p-1', orderId: 3, rating: 5, content: 'Nice' }) }))
  })

  it('rejects blank content without a request', () => {
    renderForm(<ReviewForm onDone={() => {}} review={EXISTING} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } })
    fireEvent.submit(screen.getByRole('form'))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows a server mutation error in the form', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({ message: 'Not your review' }, 403)))
    renderForm(<ReviewForm onDone={() => {}} review={EXISTING} />)
    fireEvent.submit(screen.getByRole('form'))
    expect(await screen.findByText('Not your review')).toBeVisible()
  })
})
