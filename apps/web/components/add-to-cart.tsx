'use client'

import type { Product } from '@omi/api'
import { useState } from 'react'

import { useCart } from './cart-provider'
import { useToast } from './toast'

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart()
  const { show } = useToast()
  const [pending, setPending] = useState(false)

  async function handleAdd() {
    setPending(true)
    await add(product)
    show('장바구니에 추가되었습니다')
    setPending(false)
  }

  return (
    <button
      className="button dark full"
      disabled={product.soldout || pending}
      onClick={handleAdd}
      type="button"
    >
      {product.soldout ? '품절' : pending ? '장바구니에 담는 중' : '장바구니에 담기'}
    </button>
  )
}
