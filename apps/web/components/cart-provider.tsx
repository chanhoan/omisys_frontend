'use client'

import type { Product } from '@omi/api'
import { cartReducer, createEmptyCart, getCartSummary, type CartState } from '@omi/domain'
import { createContext, type ReactNode, useContext, useEffect, useReducer } from 'react'

interface CartContextValue {
  state: CartState
  itemCount: number
  subtotal: number
  add: (product: Product) => Promise<void>
  setQuantity: (productId: string, quantity: number) => Promise<void>
  remove: (productId: string) => Promise<void>
  clear: () => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, createEmptyCart)
  const summary = getCartSummary(state)

  useEffect(() => {
    fetch('/api/carts')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          data.data &&
          typeof data.data === 'object' &&
          'items' in data.data &&
          Array.isArray((data.data as { items: unknown }).items)
        ) {
          const items = (data.data as { items: { product: Product; quantity: number }[] }).items
          dispatch({
            type: 'replace',
            items: items.map(({ product, quantity }) => ({ product, quantity })),
          })
        }
      })
      .catch(() => {})
  }, [])

  const value: CartContextValue = {
    state,
    ...summary,
    add: async (product) => {
      dispatch({ type: 'add', product })
      await fetch('/api/carts/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.productId, quantity: 1 }),
      }).catch(() => {})
    },
    setQuantity: async (productId, quantity) => {
      dispatch({ type: 'setQuantity', productId, quantity })
      if (quantity <= 0) {
        await fetch(`/api/carts/products/${encodeURIComponent(productId)}`, {
          method: 'DELETE',
        }).catch(() => {})
      } else {
        await fetch('/api/carts/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        }).catch(() => {})
      }
    },
    remove: async (productId) => {
      dispatch({ type: 'remove', productId })
      await fetch(`/api/carts/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      }).catch(() => {})
    },
    clear: async () => {
      dispatch({ type: 'clear' })
      await fetch('/api/carts/clear', { method: 'DELETE' }).catch(() => {})
    },
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
