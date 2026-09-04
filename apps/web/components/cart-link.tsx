'use client'

import Link from 'next/link'

import { useCart } from './cart-provider'
import { HeaderBagIcon } from './icons'

export function CartLink() {
  const { itemCount } = useCart()
  return (
    <Link className="header-icon-link" href="/cart" aria-label={itemCount > 0 ? `장바구니 ${itemCount}개` : '장바구니'}>
      <HeaderBagIcon />
      {itemCount > 0 ? <span className="cart-count" key={itemCount}>{itemCount}</span> : null}
    </Link>
  )
}
