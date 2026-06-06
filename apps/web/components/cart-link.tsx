'use client'

import Link from 'next/link'

import { useCart } from './cart-provider'

export function CartLink() {
  const { itemCount } = useCart()
  return <Link href="/cart" aria-label={`장바구니, 상품 ${itemCount}개`}>Bag · {itemCount}</Link>
}
