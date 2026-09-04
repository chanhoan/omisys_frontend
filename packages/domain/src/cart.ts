import type { Product } from '@omi/api'

// Cart is decoupled from the full Product. Server hydration (GET /api/carts) only carries a lean
// CartProductResponse, so product-only fields (brandName/mainColor/size/stock/limitCountPerUser/soldout)
// are optional: present when an item is added in-session from a full Product, absent on server hydration.
export interface CartItemView {
  productId: string
  name: string
  thumbnailImgUrl: string
  originalPrice: number
  discountedPrice: number
  discountPercent: number
  quantity: number
  brandName?: string
  mainColor?: string
  size?: string
  stock?: number
  limitCountPerUser?: number
  soldout?: boolean
}

export interface CartState {
  items: readonly CartItemView[]
}

export type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'replace'; items: readonly CartItemView[] }

// Project a full Product into the lean cart view (used when adding in-session or rehydrating from a fixture).
export function toCartItem(product: Product, quantity: number): CartItemView {
  return {
    productId: product.productId,
    name: product.productName,
    thumbnailImgUrl: product.thumbnailImgUrl,
    originalPrice: product.originalPrice,
    discountedPrice: product.discountedPrice,
    discountPercent: product.discountPercent,
    quantity,
    brandName: product.brandName,
    mainColor: product.mainColor,
    size: product.size,
    stock: product.stock,
    limitCountPerUser: product.limitCountPerUser,
    soldout: product.soldout,
  }
}

// The contract sends `0` for "no per-user cap" (Product.java's default), and server-hydrated
// items carry no limit at all. Both mean unlimited. SOURCE: packages/api/src/contracts.ts:24
export function getPurchaseLimit(limit: number | null | undefined): number | null {
  return limit == null || limit === 0 ? null : limit
}

function cappedQuantity(item: CartItemView, quantity: number): number {
  const limit = getPurchaseLimit(item.limitCountPerUser)
  return limit != null ? Math.min(quantity, limit) : quantity
}

export function createEmptyCart(): CartState {
  return { items: [] }
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  if (action.type === 'replace') return { items: action.items }
  if (action.type === 'clear') return createEmptyCart()
  if (action.type === 'remove') {
    return { items: state.items.filter((item) => item.productId !== action.productId) }
  }
  if (action.type === 'setQuantity') {
    return {
      items: state.items
        .filter((item) => item.productId !== action.productId || action.quantity > 0)
        .map((item) => item.productId === action.productId
          ? { ...item, quantity: cappedQuantity(item, action.quantity) }
          : item),
    }
  }

  if (action.product.soldout || action.product.stock === 0) return state
  const existing = state.items.find((item) => item.productId === action.product.productId)
  if (!existing) return { items: [...state.items, toCartItem(action.product, 1)] }
  // Prefer the incoming product's limit — hydrated items may lack limitCountPerUser.
  // Store the raw value so consumers can still tell "unlimited" (0) from "unknown" (undefined).
  const rawLimit = action.product.limitCountPerUser ?? existing.limitCountPerUser
  const limit = getPurchaseLimit(rawLimit)
  if (limit != null && existing.quantity >= limit) return state
  return {
    items: state.items.map((item) => item.productId === action.product.productId
      ? { ...item, quantity: item.quantity + 1, limitCountPerUser: rawLimit }
      : item),
  }
}

export function getCartSummary(state: CartState) {
  return state.items.reduce(
    (summary, item) => ({
      itemCount: summary.itemCount + item.quantity,
      subtotal: summary.subtotal + item.discountedPrice * item.quantity,
    }),
    { itemCount: 0, subtotal: 0 },
  )
}
