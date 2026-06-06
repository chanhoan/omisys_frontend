import { describe, expect, it } from 'vitest'

import { createGatewayPath } from './proxy-path'

describe('createGatewayPath', () => {
  it('creates a gateway API path from route segments and query', () => {
    expect(createGatewayPath(['products', 'search'], new URLSearchParams({ page: '1' }))).toBe(
      '/api/products/search?page=1',
    )
  })

  it('encodes each segment', () => {
    expect(createGatewayPath(['search', 'wide pants'], new URLSearchParams())).toBe(
      '/api/search/wide%20pants',
    )
  })

  it('rejects internal, traversal, and absolute URL input', () => {
    expect(() => createGatewayPath(['internal', 'users'], new URLSearchParams())).toThrow()
    expect(() => createGatewayPath(['..', 'internal'], new URLSearchParams())).toThrow()
    expect(() => createGatewayPath(['https://evil.test'], new URLSearchParams())).toThrow()
  })
})
