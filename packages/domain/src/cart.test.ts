import { describe, expect, it } from 'vitest'

import { cartReducer, createEmptyCart, getCartSummary, toCartItem } from './cart'
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
