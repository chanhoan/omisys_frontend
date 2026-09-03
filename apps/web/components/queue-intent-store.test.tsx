import { afterEach, describe, expect, it } from 'vitest'

import { claimQueuedIntent, clearQueuedIntent, getQueuedIntent, rememberQueueIntent } from './queue-intent-store'

describe('queue intent store', () => {
  afterEach(clearQueuedIntent)

  it('keeps a copy only until it is claimed once', () => {
    const intent = {
      method: 'POST' as const,
      url: '/api/orders',
      body: '{"addressId":3}',
      idempotencyKey: 'request-key',
    }
    rememberQueueIntent(intent)
    intent.body = '{"addressId":4}'

    expect(getQueuedIntent()).toMatchObject({ body: '{"addressId":3}' })
    expect(claimQueuedIntent()).toMatchObject({ idempotencyKey: 'request-key' })
    expect(claimQueuedIntent()).toBeNull()
  })

  it('rejects non-internal targets and missing idempotency keys', () => {
    expect(() => rememberQueueIntent({ method: 'POST', url: 'https://example.com', idempotencyKey: 'key' })).toThrow()
    expect(() => rememberQueueIntent({ method: 'POST', url: '/api/orders', idempotencyKey: ' ' })).toThrow()
  })
})
