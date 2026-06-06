import type { Product } from '@omi/api'

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: readonly CartItem[]
}

export type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'replace'; items: readonly CartItem[] }

export function createEmptyCart(): CartState {
  return { items: [] }
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  if (action.type === 'replace') return { items: action.items }
  if (action.type === 'clear') return createEmptyCart()
  if (action.type === 'remove') {
    return { items: state.items.filter(({ product }) => product.productId !== action.productId) }
  }
  if (action.type === 'setQuantity') {
    return {
      items: state.items
        .filter(({ product }) => product.productId !== action.productId || action.quantity > 0)
        .map((item) => item.product.productId === action.productId
          ? { ...item, quantity: Math.min(action.quantity, item.product.limitCountPerUser) }
          : item),
    }
  }

  if (action.product.soldout || action.product.stock === 0) return state
  const existing = state.items.find(({ product }) => product.productId === action.product.productId)
  if (!existing) return { items: [...state.items, { product: action.product, quantity: 1 }] }
  if (existing.quantity >= action.product.limitCountPerUser) return state
  return {
    items: state.items.map((item) => item.product.productId === action.product.productId
      ? { ...item, quantity: item.quantity + 1 }
      : item),
  }
}

export function getCartSummary(state: CartState) {
  return state.items.reduce(
    (summary, item) => ({
      itemCount: summary.itemCount + item.quantity,
      subtotal: summary.subtotal + item.product.discountedPrice * item.quantity,
    }),
    { itemCount: 0, subtotal: 0 },
  )
}
