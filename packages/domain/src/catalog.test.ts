import { describe, expect, it } from 'vitest'

import { formatWon, getProductBadge, sortProducts } from './catalog'
import { catalogProducts } from './fixtures'

describe('catalog domain', () => {
  it('formats Korean won without decimals', () => {
    expect(formatWon(89000)).toBe('₩89,000')
  })

  it('prioritizes sold out, discount, new badges consistently', () => {
    expect(getProductBadge({ ...catalogProducts[0], soldout: true })).toBe('SOLD OUT')
    expect(getProductBadge({ ...catalogProducts[0], discountPercent: 15 })).toBe('15% OFF')
    expect(getProductBadge({ ...catalogProducts[0], discountPercent: 0 })).toBe('NEW')
    expect(getProductBadge({
      ...catalogProducts[0],
      discountPercent: 0,
      tags: ['EDITORIAL'],
    })).toBe('EDITORIAL')
  })

  it('returns immutable sorted copies', () => {
    const input = [...catalogProducts]
    const result = sortProducts(input, 'price-low')

    expect(result[0].discountedPrice).toBeLessThanOrEqual(result[1].discountedPrice)
    expect(input).toEqual(catalogProducts)
    expect(result).not.toBe(input)
  })

  it('sorts newest and popular catalogs', () => {
    expect(sortProducts(catalogProducts, 'newest')[0].productName).toBe('Night Shirt')
    expect(sortProducts(catalogProducts, 'popular')[0].productName).toBe('Quiet Wide Trousers')
  })
})
