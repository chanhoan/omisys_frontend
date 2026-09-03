import '@testing-library/jest-dom/vitest'

import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({ default: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a> }))
vi.mock('./toast', () => ({ useToast: () => ({ show: vi.fn() }) }))

import { QueueClient } from './queue-client'
import { clearQueuedIntent, rememberQueueIntent } from './queue-intent-store'

function queueResponse(status: 202 | 200 | 410, data: object, retryAfter?: string) {
  return new Response(JSON.stringify({ statusName: status === 202 ? 'ACCEPTED' : 'OK', message: null, data }), {
    status,
    headers: retryAfter ? { 'Retry-After': retryAfter } : undefined,
  })
}

async function flushQueueRequest() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('QueueClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearQueuedIntent()
    rememberQueueIntent({
      method: 'POST',
      url: '/api/orders',
      body: '{"addressId":3}',
      idempotencyKey: 'order-key',
    })
  })

  afterEach(() => {
    cleanup()
    clearQueuedIntent()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('uses the longest server retry interval before polling again', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(queueResponse(202, { state: 'WAITING', rank: 5, retryAfterSeconds: 30 }, '40'))
      .mockResolvedValueOnce(queueResponse(410, { state: 'EXPIRED', rank: null, retryAfterSeconds: null })))

    render(<QueueClient />)

    await flushQueueRequest()
    expect(screen.getByText('거의 다 왔습니다')).toBeVisible()
    expect(screen.getByText(/초 후 재확인/)).toHaveTextContent('40')
    await act(() => vi.advanceTimersByTimeAsync(39_999))
    expect(fetch).toHaveBeenCalledTimes(1)
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(screen.getByText('대기 순번이 만료되었습니다')).toBeVisible()
  })

  it('replays the in-memory request once when the queue is ready', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(queueResponse(200, { state: 'READY', rank: null, retryAfterSeconds: null }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ statusName: 'OK', message: 'Order created', data: { orderId: 1 } }), { status: 201 })))

    render(<QueueClient />)

    await flushQueueRequest()
    expect(screen.getByText('요청이 완료되었습니다')).toBeVisible()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenLastCalledWith('/api/orders', expect.objectContaining({
      method: 'POST',
      body: '{"addressId":3}',
      headers: expect.any(Headers),
    }))
    const [, options] = vi.mocked(fetch).mock.calls[1] ?? []
    expect(new Headers(options?.headers).get('Idempotency-Key')).toBe('order-key')
  })

  it('shows the downstream failure rather than treating it as another queue state', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(queueResponse(200, { state: 'READY', rank: null, retryAfterSeconds: null }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ statusName: 'CONFLICT', message: null, data: null }), { status: 409 })))

    render(<QueueClient />)
    await flushQueueRequest()

    expect(screen.getByText('준비된 수량이 모두 소진되었습니다')).toBeVisible()
    expect(screen.getByText('요청을 완료하지 못했습니다.')).toBeVisible()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('uses the payload cadence when Retry-After is absent or shorter', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(queueResponse(202, { state: 'WAITING', rank: 12, retryAfterSeconds: 30 }, '12'))
      .mockResolvedValueOnce(queueResponse(410, { state: 'EXPIRED', rank: null, retryAfterSeconds: null })))

    render(<QueueClient />)
    await flushQueueRequest()

    expect(screen.getByText(/초 후 재확인/)).toHaveTextContent('30')
    await act(() => vi.advanceTimersByTimeAsync(29_999))
    expect(fetch).toHaveBeenCalledTimes(1)
    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(screen.getByText('대기 순번이 만료되었습니다')).toBeVisible()
  })

  it('surfaces an invalid queue response without replaying the intent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      queueResponse(200, { state: 'WAITING', rank: 3, retryAfterSeconds: 30 }),
    ))

    render(<QueueClient />)
    await flushQueueRequest()

    expect(screen.getByRole('alert')).toHaveTextContent('일치하지 않습니다')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('surfaces a malformed queue payload without replaying the intent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', { status: 502 })))

    render(<QueueClient />)
    await flushQueueRequest()

    expect(screen.getByRole('alert')).toHaveTextContent('확인할 수 없습니다')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('shows a safe return state after reload loses the memory-only intent', () => {
    clearQueuedIntent()
    vi.stubGlobal('fetch', vi.fn())

    render(<QueueClient returnHref="/shop" />)

    expect(screen.getByText('대기 순번이 만료되었습니다')).toBeVisible()
    expect(screen.getByRole('link', { name: '스토어로' })).toHaveAttribute('href', '/shop')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('clears its scheduled poll on unmount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      queueResponse(202, { state: 'WAITING', rank: 5, retryAfterSeconds: 30 }),
    ))
    const screenView = render(<QueueClient />)
    await flushQueueRequest()
    expect(screen.getByText('거의 다 왔습니다')).toBeVisible()

    screenView.unmount()
    await act(() => vi.advanceTimersByTimeAsync(30_000))
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
