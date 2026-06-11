import type { Product } from '@omi/api'
import { cartReducer, catalogProducts, createEmptyCart, getCartSummary, toCartItem, type CartState } from '@omi/domain'
import * as SecureStore from 'expo-secure-store'
import { createContext, type ReactNode, useContext, useEffect, useReducer } from 'react'

const STORAGE_KEY = 'omi.cart.v1'

interface MobileCartContextValue {
  state: CartState
  itemCount: number
  subtotal: number
  add: (product: Product) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const MobileCartContext = createContext<MobileCartContextValue | undefined>(undefined)

export function MobileCartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, createEmptyCart)

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((value) => {
        if (!value) return
        const parsed = JSON.parse(value) as { productId: string; quantity: number }[]
        if (!Array.isArray(parsed)) return
        const items = parsed.flatMap(({ productId, quantity }) => {
          const product = catalogProducts.find((item) => item.productId === productId)
          return product ? [toCartItem(product, quantity)] : []
        })
        dispatch({ type: 'replace', items })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const storedItems = state.items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(storedItems)).catch(() => {})
  }, [state])

  const value = {
    state,
    ...getCartSummary(state),
    add: (product: Product) => dispatch({ type: 'add', product }),
    setQuantity: (productId: string, quantity: number) => dispatch({ type: 'setQuantity', productId, quantity }),
    remove: (productId: string) => dispatch({ type: 'remove', productId }),
    clear: () => dispatch({ type: 'clear' }),
  }

  return <MobileCartContext.Provider value={value}>{children}</MobileCartContext.Provider>
}

export function useMobileCart() {
  const context = useContext(MobileCartContext)
  if (!context) throw new Error('useMobileCart must be used inside MobileCartProvider')
  return context
}
