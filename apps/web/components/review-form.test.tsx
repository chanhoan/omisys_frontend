import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReviewForm } from './review-form'
import { ToastProvider } from './toast'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: () => {} }),
}))

const EXISTING = { reviewId: 7, rating: 4, content: '고칠 내용' }

function renderForm(ui: ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function submitForm(container: HTMLElement) {
  const form = container.querySelector('form')
  if (!form) throw new Error('폼이 열려 있지 않습니다.')
  fireEvent.submit(form)
}

function bodyOf(call: unknown): Record<string, unknown> {
  const [, init] = call as [string, RequestInit]
  return JSON.parse(String(init.body)) as Record<string, unknown>
}

describe('ReviewForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ statusName: 'OK', message: null, data: null })))
  })

  afterEach(() => {
    // vitest 에 globals 가 꺼져 있어 RTL 자동 cleanup 이 걸리지 않는다.
    cleanup()
    vi.unstubAllGlobals()
  })

  it('starts collapsed when writing a new review', () => {
    renderForm(<ReviewForm orderId={3} productId="p-1" />)

    expect(screen.getByRole('button', { name: '리뷰 작성' })).toBeVisible()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('posts the product and order ids when writing', async () => {
    const { container } = renderForm(<ReviewForm orderId={3} productId="p-1" />)
    fireEvent.click(screen.getByRole('button', { name: '리뷰 작성' }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '좋아요' } })

    submitForm(container)

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [path] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(path).toBe('/api/reviews')
    expect(bodyOf(vi.mocked(fetch).mock.calls[0])).toEqual({
      productId: 'p-1',
      orderId: 3,
      rating: 5,
      content: '좋아요',
    })
  })

  it('opens prefilled and patches by review id when editing', async () => {
    const { container } = renderForm(<ReviewForm onDone={() => {}} review={EXISTING} />)

    expect(screen.getByRole('textbox')).toHaveValue('고칠 내용')
    expect(screen.getByRole('combobox')).toHaveValue('4')

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '고친 내용' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } })
    submitForm(container)

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    const [path] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(path).toBe('/api/reviews/7')
    expect(bodyOf(vi.mocked(fetch).mock.calls[0])).toEqual({ rating: 3, content: '고친 내용' })
  })

  it('closes and reports back after a successful edit', async () => {
    const onDone = vi.fn()
    const { container } = renderForm(<ReviewForm onDone={onDone} review={EXISTING} />)

    submitForm(container)

    await waitFor(() => expect(onDone).toHaveBeenCalled())
    expect(screen.getByText('리뷰가 수정되었습니다.')).toBeVisible()
  })

  it('reports back when the viewer cancels', () => {
    const onDone = vi.fn()
    renderForm(<ReviewForm onDone={onDone} review={EXISTING} />)

    fireEvent.click(screen.getByRole('button', { name: '취소' }))

    expect(onDone).toHaveBeenCalled()
  })

  it('refuses to send a blank review', () => {
    const { container } = renderForm(<ReviewForm onDone={() => {}} review={EXISTING} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } })

    submitForm(container)

    expect(fetch).not.toHaveBeenCalled()
  })

  it('surfaces the server message when the update is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(
      { statusName: 'FORBIDDEN', message: '본인 리뷰만 수정할 수 있습니다.', data: null },
      403,
    )))
    const { container } = renderForm(<ReviewForm onDone={() => {}} review={EXISTING} />)

    submitForm(container)

    expect(await screen.findByText('본인 리뷰만 수정할 수 있습니다.')).toBeVisible()
  })

  it('falls back to the thrown message when the request itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    const { container } = renderForm(<ReviewForm onDone={() => {}} review={EXISTING} />)

    submitForm(container)

    expect(await screen.findByText('offline')).toBeVisible()
  })
})
