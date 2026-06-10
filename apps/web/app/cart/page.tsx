'use client'

import { formatWon } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'

import { useCart } from '../../components/cart-provider'

export default function CartPage() {
  const { state, subtotal, setQuantity, remove } = useCart()

  return (
    <section className="cart-page section">
      <div className="cart-title"><p className="eyebrow">YOUR SELECTION</p><h1>Bag</h1></div>
      {state.items.length === 0 ? (
        <div className="cart-empty"><p>아직 장바구니가 비어 있습니다.</p><Link className="button dark" href="/shop">Explore shop</Link></div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {state.items.map((item) => (
              <article className="cart-item" key={item.productId}>
                <div className="cart-thumb">{item.thumbnailImgUrl ? <Image alt="" fill sizes="140px" src={item.thumbnailImgUrl} /> : null}</div>
                <div className="cart-item-copy">
                  {item.brandName ? <p className="eyebrow">{item.brandName}</p> : null}
                  <h2>{item.name}</h2>
                  {item.mainColor || item.size ? <p>{[item.mainColor, item.size].filter(Boolean).join(' · ')}</p> : null}
                  <div className="quantity-control" aria-label={`${item.name} 수량`}>
                    <button onClick={() => setQuantity(item.productId, item.quantity - 1)} type="button" aria-label="수량 줄이기">−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => setQuantity(item.productId, item.quantity + 1)} type="button" aria-label="수량 늘리기">+</button>
                  </div>
                  <button className="remove-button" onClick={() => remove(item.productId)} type="button">Remove</button>
                </div>
                <strong>{formatWon(item.discountedPrice * item.quantity)}</strong>
              </article>
            ))}
          </div>
          <aside className="order-summary">
            <p className="eyebrow">ORDER SUMMARY</p>
            <div><span>Subtotal</span><strong>{formatWon(subtotal)}</strong></div>
            <div><span>Delivery</span><span>결제 단계에서 계산</span></div>
            <Link className="button dark full" href="/checkout">Continue to checkout</Link>
          </aside>
        </div>
      )}
    </section>
  )
}
