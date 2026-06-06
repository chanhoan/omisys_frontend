import { describe, expect, it } from 'vitest'

import { parsePaymentLink } from './payment-link'

describe('parsePaymentLink', () => {
  it('accepts OMI success links with a numeric order id', () => {
    expect(parsePaymentLink('omi://payments/result?status=success&orderId=42')).toEqual({
      status: 'success',
      orderId: 42,
      route: '/orders/42',
    })
  })

  it('accepts failure links without exposing arbitrary redirect paths', () => {
    expect(parsePaymentLink('omi://payments/result?status=fail&orderId=42&redirect=https://evil.test')).toEqual({
      status: 'fail',
      orderId: 42,
      route: '/checkout/result?status=fail&orderId=42',
    })
  })

  it('rejects untrusted schemes and invalid identifiers', () => {
    expect(() => parsePaymentLink('https://evil.test/payments/result?status=success&orderId=1')).toThrow()
    expect(() => parsePaymentLink('omi://payments/result?status=success&orderId=abc')).toThrow()
  })
})
