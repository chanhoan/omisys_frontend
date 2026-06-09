'use client'

import type { Address } from '@omi/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useCart } from './cart-provider'

interface CheckoutFormProps {
  addresses: Address[]
}

export function CheckoutForm({ addresses }: CheckoutFormProps) {
  const router = useRouter()
  const { state, clear } = useCart()
  const [addressId, setAddressId] = useState<number | ''>(addresses[0]?.id ?? '')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  if (state.items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>장바구니가 비어 있습니다.</p>
        <a className="button dark" href="/shop">Shop</a>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addressId) { setError('배송지를 선택해주세요.'); return }
    setError('')
    setPending(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          orderType: 'NORMAL',
          orderProductInfos: state.items.map(({ product, quantity }) => ({
            productId: product.productId,
            quantity,
            userCouponId: null,
          })),
          pointPrice: 0,
          addressId,
          clientChannel: 'WEB',
        }),
      })
      const payload = await res.json() as { data?: { orderId?: number; checkoutUrl?: string }; message?: string }
      if (!res.ok) throw new Error(payload.message ?? '주문 오류가 발생했습니다.')
      const { orderId, checkoutUrl } = payload.data ?? {}
      await clear()
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        router.push(`/checkout/result?status=success&orderId=${orderId ?? ''}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 오류가 발생했습니다.')
      setPending(false)
    }
  }

  const subtotal = state.items.reduce(
    (sum, { product, quantity }) => sum + product.discountedPrice * quantity,
    0,
  )
  const formattedSubtotal = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(subtotal)

  return (
    <form className="checkout-layout" onSubmit={handleSubmit}>
      <div className="checkout-main">
        <section className="checkout-section">
          <h2>배송지</h2>
          {addresses.length === 0 ? (
            <p>등록된 배송지가 없습니다. <a href="/account/addresses">배송지 추가</a></p>
          ) : (
            <ul className="address-radio-list">
              {addresses.map((addr) => (
                <li key={addr.id}>
                  <label className="address-radio">
                    <input
                      checked={addressId === addr.id}
                      name="addressId"
                      onChange={() => setAddressId(addr.id)}
                      type="radio"
                      value={addr.id}
                    />
                    <span>
                      <strong>{addr.recipient}</strong> {addr.phoneNumber}<br />
                      ({addr.zipcode}) {addr.address}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="checkout-section">
          <h2>주문 상품</h2>
          <ul className="checkout-items">
            {state.items.map(({ product, quantity }) => (
              <li key={product.productId}>
                <span>{product.productName}</span>
                <span>×{quantity}</span>
                <span>{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(product.discountedPrice * quantity)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="checkout-summary">
        <p className="eyebrow">ORDER TOTAL</p>
        <div className="summary-row"><span>Subtotal</span><strong>{formattedSubtotal}</strong></div>
        <div className="summary-row"><span>Delivery</span><span>배송비 별도</span></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button dark full" disabled={pending || addresses.length === 0} type="submit">
          {pending ? '주문 처리 중…' : '주문하기'}
        </button>
      </aside>
    </form>
  )
}
