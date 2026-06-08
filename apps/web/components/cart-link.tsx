'use client'

import Link from 'next/link'

import { useCart } from './cart-provider'

export function CartLink() {
  const { itemCount } = useCart()
  return (
    <Link className="header-icon-link cart-icon-link" href="/cart" aria-label={`장바구니, 상품 ${itemCount}개`}>
      <svg aria-hidden="true" className="header-icon" viewBox="0 0 24 24">
        <path d="M6.5 8.5h11l1 12h-13l1-12Z" />
        <path d="M9 9V6.75a3 3 0 0 1 6 0V9" />
      </svg>
      {itemCount > 0 ? <span className="cart-count" key={itemCount}>{itemCount}</span> : null}
    </Link>
  )
}
