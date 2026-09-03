'use client'

import type { ProductListItem } from '@omi/api'
import { useMemo, useSyncExternalStore } from 'react'

import { useCart } from './cart-provider'
import { ProductCard } from './product-card'
import { parseViewedProducts, readServerViewedProductsRaw, readViewedProductsRaw, subscribeViewedProducts } from './recently-viewed-store'

// 시안(OMI 01 홈 - 로그인)의 "이어서 보기" 레일. 브랜드 줄 뒤에 이 사용자에게만 해당하는
// 맥락(최근 본 / 장바구니에 있음 / 재입고 알림)을 덧붙인다.
export function ContinueRail({ products }: { products: readonly ProductListItem[] }) {
  const { state } = useCart()
  const rawViewed = useSyncExternalStore(subscribeViewedProducts, readViewedProductsRaw, readServerViewedProductsRaw)
  const viewed = useMemo(() => parseViewedProducts(rawViewed), [rawViewed])

  return (
    <div className="product-grid">
      {products.map((product) => {
        const inCart = state.items.some((item) => item.productId === product.productId)
        const suffix = product.soldout ? '재입고 알림' : inCart ? '장바구니에 있음' : viewed.includes(product.productId) ? '최근 본' : undefined
        return <ProductCard brandSuffix={suffix} key={product.productId} product={product} />
      })}
    </div>
  )
}
