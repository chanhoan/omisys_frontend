import { describe, expect, it } from 'vitest'

import { cartReducer, createEmptyCart, getCartSummary, getPurchaseLimit, toCartItem } from './cart'
import { catalogProducts } from './fixtures'

describe('cartReducer', () => {
  it('adds new products without mutating the previous cart', () => {
    const previous = createEmptyCart()
    const next = cartReducer(previous, { type: 'add', product: catalogProducts[0] })

    expect(previous.items).toHaveLength(0)
    expect(next.items).toEqual([toCartItem(catalogProducts[0], 1)])
    expect(next).not.toBe(previous)
  })

  it('increments existing products up to their user limit', () => {
    const once = cartReducer(createEmptyCart(), { type: 'add', product: catalogProducts[0] })
    const twice = cartReducer(once, { type: 'add', product: catalogProducts[0] })
    const limited = cartReducer(twice, { type: 'add', product: catalogProducts[0] })

    expect(twice.items[0].quantity).toBe(2)
    expect(limited).toEqual(twice)
  })

  it('updates quantity, removes items, and calculates summary', () => {
    const added = cartReducer(createEmptyCart(), { type: 'add', product: catalogProducts[1] })
    const updated = cartReducer(added, { type: 'setQuantity', productId: catalogProducts[1].productId, quantity: 1 })
    const summary = getCartSummary(updated)
    const removed = cartReducer(updated, { type: 'remove', productId: catalogProducts[1].productId })

    expect(summary).toEqual({ itemCount: 1, subtotal: catalogProducts[1].discountedPrice })
    expect(removed.items).toHaveLength(0)
  })

  it('does not add sold-out products', () => {
    expect(cartReducer(createEmptyCart(), { type: 'add', product: catalogProducts[3] })).toEqual(createEmptyCart())
  })
})

// 계약상 limitCountPerUser === 0 은 "한도 없음" 이다. SOURCE: packages/api/src/contracts.ts:24
describe('per-user purchase limit of 0', () => {
  const unlimited = { ...catalogProducts[0], limitCountPerUser: 0 }

  it('reads 0, null and undefined as no limit', () => {
    expect(getPurchaseLimit(0)).toBeNull()
    expect(getPurchaseLimit(null)).toBeNull()
    expect(getPurchaseLimit(undefined)).toBeNull()
  })

  it('keeps a positive limit as-is', () => {
    expect(getPurchaseLimit(3)).toBe(3)
  })

  it('keeps adding a product whose limit is 0', () => {
    const once = cartReducer(createEmptyCart(), { type: 'add', product: unlimited })
    const twice = cartReducer(once, { type: 'add', product: unlimited })
    const thrice = cartReducer(twice, { type: 'add', product: unlimited })

    expect(thrice.items[0].quantity).toBe(3)
  })

  it('does not clamp the quantity of a product whose limit is 0', () => {
    const added = cartReducer(createEmptyCart(), { type: 'add', product: unlimited })
    const raised = cartReducer(added, { type: 'setQuantity', productId: unlimited.productId, quantity: 7 })

    expect(raised.items[0].quantity).toBe(7)
  })

  it('still enforces a positive limit', () => {
    const limited = { ...catalogProducts[0], limitCountPerUser: 2 }
    const added = cartReducer(createEmptyCart(), { type: 'add', product: limited })
    const raised = cartReducer(added, { type: 'setQuantity', productId: limited.productId, quantity: 9 })

    expect(raised.items[0].quantity).toBe(2)
  })
})
