import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PreorderButton } from './preorder-button'
import { clearQueuedIntent, getQueuedIntent } from './queue-intent-store'

const push = vi.fn()
const refresh = vi.fn()
const show = vi.fn()

vi.mock('next/link', () => ({ default: ({ children, ...props }: React.ComponentProps<'a'>) => <a {...props}>{children}</a> }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))
vi.mock('./toast', () => ({ useToast: () => ({ show }) }))

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

describe('PreorderButton', () => {
  beforeEach(() => {
    push.mockClear()
    refresh.mockClear()
    show.mockClear()
    clearQueuedIntent()
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'preorder-key') })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('preserves a queued pre-order for replay instead of treating admission as success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({
      statusName: 'ACCEPTED',
      message: null,
      data: { state: 'WAITING', rank: 2, retryAfterSeconds: 30 },
    }, 202)))
    render(<PreorderButton addressId={7} authenticated preOrderId={4} state="open" />)

    fireEvent.click(screen.getByRole('button', { name: '예약하기' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/queue'))
    expect(show).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
    expect(getQueuedIntent()).toEqual({
      method: 'POST',
      url: '/api/preorders/4/order?addressId=7',
      idempotencyKey: 'preorder-key',
    })
  })
})
