'use client'

import { formatWon, getPurchaseLimit } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'

import { Banner } from '../../components/banner'
import { useCart } from '../../components/cart-provider'
import { BagIcon, WarningTriangleIcon } from '../../components/icons'
import { Sentences } from '../../components/sentences'

const FREE_SHIPPING_THRESHOLD = 50_000
const soldoutSentences = ['품절된 제품이 있습니다.', '주문하려면 해당 제품을 삭제해주세요.'] as const

export default function CartPage() {
  const { state, subtotal, setQuantity, remove } = useCart()
  const originalTotal = state.items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0)
  const discount = originalTotal - subtotal
  const soldoutCount = state.items.filter((item) => item.soldout).length

  return (
    <section className="cart-page section">
      <div className="cart-title"><p className="eyebrow">CART</p><h1>장바구니.</h1></div>
      {state.items.length === 0 ? (
        <div className="cart-empty">
          <span className="state-icon"><BagIcon /></span>
          <p className="muted">담긴 제품이 없습니다.</p>
          <Link className="button dark" href="/shop">스토어 보기</Link>
        </div>
      ) : (
        <>
          {soldoutCount > 0 ? (
            <Banner icon={<WarningTriangleIcon />} style={{ marginTop: 20 }} tone="warn">
              <Sentences sentences={[`품절된 제품 ${soldoutCount}개가 있습니다.`, soldoutSentences[1]]} />
            </Banner>
          ) : null}
          <div className="cart-layout">
            <div className="cart-items">
              {state.items.map((item) => {
                const purchaseLimit = getPurchaseLimit(item.limitCountPerUser)
                const atLimit = purchaseLimit != null && item.quantity >= purchaseLimit
                return (
                  <article className="cart-item" key={item.productId} style={item.soldout ? { opacity: 0.6 } : undefined}>
                    <span className="cart-thumb">{item.thumbnailImgUrl ? <Image alt={item.name} fill sizes="140px" src={item.thumbnailImgUrl} /> : null}</span>
                    <div className="cart-item-copy">
                      {item.brandName ? <p className="eyebrow">{item.brandName}</p> : null}
                      <h2>{item.name}</h2>
                      {item.mainColor || item.size ? <p>{[item.mainColor, item.size].filter(Boolean).join(' · ')}</p> : null}
                      {item.soldout ? (
                        <span className="status-badge status-cancelled" style={{ marginTop: 10 }}>품절</span>
                      ) : (
                        <>
                          <div aria-label="수량" className="quantity-control" role="group">
                            <button aria-label="수량 줄이기" onClick={() => setQuantity(item.productId, item.quantity - 1)} type="button">−</button>
                            <span>{item.quantity}</span>
                            <button aria-label="수량 늘리기" disabled={atLimit} onClick={() => setQuantity(item.productId, item.quantity + 1)} type="button">+</button>
                          </div>
                          {atLimit ? <p className="app-note" style={{ marginTop: 8 }}>1인 구매 한도 {purchaseLimit}개에 도달했습니다.</p> : null}
                        </>
                      )}
                      <button className="remove-button" onClick={() => remove(item.productId)} type="button">삭제</button>
                    </div>
                    <strong>{formatWon(item.discountedPrice * item.quantity)}</strong>
                  </article>
                )
              })}
            </div>
            <aside className="order-summary">
              <p className="eyebrow">ORDER SUMMARY</p>
              <div><span>상품 금액</span><strong>{formatWon(originalTotal)}</strong></div>
              {discount > 0 ? <div><span>할인</span><span>−{formatWon(discount)}</span></div> : null}
              <div><span>배송비</span><span>{subtotal >= FREE_SHIPPING_THRESHOLD ? '무료' : '결제 단계에서 계산'}</span></div>
              <div style={{ borderBottom: 0, paddingTop: 16, fontWeight: 600 }}>
                <span>결제 예정</span>
                <strong style={{ fontSize: 21, letterSpacing: '-.035em' }}>{formatWon(subtotal)}</strong>
              </div>
              <p className="summary-note">{formatWon(FREE_SHIPPING_THRESHOLD)} 이상 무료배송. 쿠폰과 포인트는 다음 단계에서 적용합니다.</p>
              <Link className="button dark full" href="/checkout">주문하기</Link>
            </aside>
          </div>
        </>
      )}
    </section>
  )
}
