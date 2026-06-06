import { describe, expect, it } from 'vitest'

import { safeNextPath } from './safe-next-path'

describe('safeNextPath', () => {
  it('allows internal application paths', () => {
    expect(safeNextPath('/checkout?step=address')).toBe('/checkout?step=address')
  })

  it('falls back for absolute, protocol-relative, and malformed paths', () => {
    expect(safeNextPath('https://evil.test')).toBe('/account')
    expect(safeNextPath('//evil.test')).toBe('/account')
    expect(safeNextPath(null)).toBe('/account')
  })
})
