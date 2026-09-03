'use client'

import { queueApiResponseSchema, type Address, type Coupon } from '@omi/api'
import { formatDate, formatWon } from '@omi/domain'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { useCart } from './cart-provider'
import { FormErrorBox } from './form-error-box'
import { LockIcon, PinIcon } from './icons'
import { rememberQueueIntent } from './queue-intent-store'
import { Sentences } from './sentences'
import { StateBlock } from './state-block'

interface CheckoutFormProps {
  addresses: Address[]
  availablePoints: number
  coupons: Coupon[]
}

const DELIVERY_FREE_THRESHOLD = 50_000
const PAY_METHODS = ['카카오페이', '네이버페이', '토스', '신용·체크카드'] as const
const idemSentences = ['암호화된 경로로 진행됩니다.', '새로고침해도 중복 결제되지 않습니다.'] as const

export function getCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.minBuyPrice != null && subtotal < coupon.minBuyPrice) return 0

  const rawDiscount = coupon.discountType === 'PERCENTAGE'
    ? Math.floor(subtotal * (coupon.discountValue / 100))
    : coupon.discountValue
  const cappedDiscount = coupon.maxDiscountPrice == null
    ? rawDiscount
    : Math.min(rawDiscount, coupon.maxDiscountPrice)

  return Math.min(Math.max(cappedDiscount, 0), subtotal)
}

function parseCouponEndDate(value: string | number): Date | null {
  const normalized = typeof value === 'number' && /^\d{8}$/.test(String(value))
    ? `${String(value).slice(0, 4)}-${String(value).slice(4, 6)}-${String(value).slice(6, 8)}`
    : value
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getCouponIneligibility(coupon: Coupon, subtotal: number, now = new Date()): string | null {
  if (coupon.minBuyPrice != null && subtotal < coupon.minBuyPrice) {
    return `${formatWon(coupon.minBuyPrice)} 이상 주문 시 사용할 수 있습니다.`
  }

  if (coupon.endDate != null) {
    const endDate = parseCouponEndDate(coupon.endDate)
    if (endDate != null && endDate.getTime() < now.getTime()) {
      return '사용 기간이 만료되었습니다.'
    }
  }

  return null
}

export function getPointLimit(availablePoints: number, subtotalAfterCoupon: number): number {
  return Math.max(0, Math.min(availablePoints, subtotalAfterCoupon))
}

function couponConditions(coupon: Coupon): string {
  const parts: string[] = []
  if (coupon.minBuyPrice) parts.push(`${formatWon(coupon.minBuyPrice)} 이상`)
  if (coupon.maxDiscountPrice) parts.push(`최대 ${formatWon(coupon.maxDiscountPrice)}`)
  if (coupon.endDate != null) {
    const endDate = parseCouponEndDate(coupon.endDate)
    if (endDate) parts.push(`${formatDate(endDate.toISOString())} 만료`)
  }
  return parts.length > 0 ? parts.join(' · ') : '금액 조건 없음'
}

export function CheckoutForm({ addresses, availablePoints, coupons }: CheckoutFormProps) {
  const router = useRouter()
  const { state, clear } = useCart()
  const [addressId, setAddressId] = useState<number | ''>(addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? '')
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null)
  const [pointInput, setPointInput] = useState('0')
  const [payMethod, setPayMethod] = useState<string>(PAY_METHODS[0])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const idempotencyKey = useRef<string | null>(null)

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0,
  )
  const selectedCoupon = coupons.find((coupon) => coupon.couponId === selectedCouponId) ?? null
  const selectedCouponIneligibility = selectedCoupon == null
    ? null
    : getCouponIneligibility(selectedCoupon, subtotal)
  const couponDiscount = selectedCoupon != null && selectedCouponIneligibility == null
    ? getCouponDiscount(selectedCoupon, subtotal)
    : 0
  const pointLimit = getPointLimit(availablePoints, subtotal - couponDiscount)
  const requestedPoints = Number.parseInt(pointInput.replaceAll(',', ''), 10)
  const pointPrice = Number.isFinite(requestedPoints) ? Math.min(Math.max(requestedPoints, 0), pointLimit) : 0
  const deliveryIsFree = subtotal >= DELIVERY_FREE_THRESHOLD
  const total = Math.max(0, subtotal - couponDiscount - pointPrice)
  const hasAddress = addresses.length > 0

  if (state.items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>장바구니가 비어 있습니다.</p>
        <Link className="button dark" href="/shop">스토어 보기</Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!addressId) { setError('배송지를 선택해주세요.'); return }
    if (selectedCouponIneligibility) { setError(selectedCouponIneligibility); return }
    setError('')
    setPending(true)
    try {
      idempotencyKey.current ??= crypto.randomUUID()
      const order = {
        orderType: 'NORMAL' as const,
        orderProductInfos: state.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          userCouponId: selectedCoupon?.couponId ?? null,
        })),
        pointPrice,
        addressId,
      }
      const body = JSON.stringify(order)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey.current,
        },
        body,
      })
      const payload: unknown = await res.json().catch(() => null)
      if (res.status === 202) {
        const queued = queueApiResponseSchema.safeParse(payload)
        if (!queued.success || queued.data.data.state !== 'WAITING') {
          throw new Error('대기열 응답을 확인할 수 없습니다. 다시 시도해주세요.')
        }
        rememberQueueIntent({
          method: 'POST',
          url: '/api/orders',
          body,
          contentType: 'application/json',
          idempotencyKey: idempotencyKey.current,
        })
        router.push('/queue')
        return
      }
      const result = payload as { data?: { orderId?: number; checkoutUrl?: string }; message?: string } | null
      if (!res.ok) throw new Error(result?.message ?? '주문 오류가 발생했습니다.')
      const { orderId, checkoutUrl } = result?.data ?? {}
      if (checkoutUrl) {
        // The payment provider has not confirmed the charge yet. Keep the cart until a
        // terminal result is available so a failed or cancelled payment can be retried.
        window.location.href = checkoutUrl
      } else {
        await clear()
        idempotencyKey.current = null
        router.push(`/checkout/result?status=success&orderId=${orderId ?? ''}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문 오류가 발생했습니다.')
      setPending(false)
    }
  }

  return (
    <form className="checkout-layout" onSubmit={handleSubmit}>
      <div className="checkout-main">
        <section className="checkout-section">
          <h2>배송지</h2>
          {hasAddress ? (
            <>
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
                        <strong>{addr.recipient}</strong> {addr.phoneNumber} {addr.isDefault ? <span className="address-default-tag">기본</span> : null}<br />
                        ({addr.zipcode}) {addr.address}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="form-actions">
                <Link className="button ghost small" href="/account/addresses">배송지 추가</Link>
                <Link className="button ghost small" href="/account/addresses">배송지 관리</Link>
              </div>
            </>
          ) : (
            <StateBlock
              action={<Link className="button dark" href="/account/addresses">배송지 추가</Link>}
              description="주문을 진행하려면 배송지를 먼저 등록해주세요."
              icon={<PinIcon />}
              style={{ padding: '44px 24px' }}
              title="등록된 배송지가 없습니다"
            />
          )}
        </section>

        <section className="checkout-section">
          <h2>주문 상품</h2>
          <ul className="checkout-items">
            {state.items.map((item) => (
              <li key={item.productId}>
                <span>{[item.name, [item.mainColor, item.size].filter(Boolean).join(' / ')].filter(Boolean).join(' · ')}</span>
                <span>×{item.quantity}</span>
                <span>{formatWon(item.discountedPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="checkout-section">
          <h2>쿠폰</h2>
          <div className="coupon-select">
            {coupons.map((coupon) => {
              const ineligibility = getCouponIneligibility(coupon, subtotal)
              const discount = ineligibility == null ? getCouponDiscount(coupon, subtotal) : 0
              return (
                <label className={ineligibility ? 'coupon-option is-disabled' : 'coupon-option'} key={coupon.couponId}>
                  <input
                    checked={selectedCouponId === coupon.couponId}
                    disabled={ineligibility !== null}
                    name="coupon"
                    onChange={() => setSelectedCouponId(coupon.couponId)}
                    type="radio"
                  />
                  <span className="coupon-option-body">
                    <strong>{coupon.name}</strong>
                    <span>{ineligibility ?? couponConditions(coupon)}</span>
                  </span>
                  <span className="coupon-option-cut">−{formatWon(discount)}</span>
                </label>
              )
            })}
            <label className="coupon-option">
              <input
                checked={selectedCouponId === null}
                name="coupon"
                onChange={() => setSelectedCouponId(null)}
                type="radio"
              />
              <span className="coupon-option-body"><strong>사용하지 않음</strong><span>쿠폰을 다음 주문에 사용합니다</span></span>
            </label>
          </div>
        </section>

        <section className="checkout-section">
          <h2>포인트</h2>
          <div className="point-field">
            <div className="point-input">
              <input
                aria-label="사용할 포인트"
                inputMode="numeric"
                onChange={(event) => setPointInput(event.target.value.replace(/[^0-9]/g, ''))}
                type="text"
                value={pointInput}
              />
              <button className="button ghost" onClick={() => setPointInput(String(pointLimit))} type="button">전액 사용</button>
            </div>
            <p className="point-avail">보유 <b>{availablePoints.toLocaleString('ko-KR')} P</b> · 이 주문에 최대 <b>{pointLimit.toLocaleString('ko-KR')} P</b> 사용 가능</p>
          </div>
        </section>

        <section className="checkout-section">
          <h2>결제 수단</h2>
          <div className="pay-methods">
            {PAY_METHODS.map((method) => (
              <label className="pay-method" key={method}>
                <input checked={payMethod === method} name="pay" onChange={() => setPayMethod(method)} type="radio" />{method}
              </label>
            ))}
          </div>
          <p className="app-note" style={{ marginTop: 12 }}>결제처 화면으로 이동한 뒤 자동으로 돌아옵니다.</p>
        </section>
      </div>

      <aside className="checkout-summary">
        <p className="eyebrow">ORDER TOTAL</p>
        <div className="summary-row"><span>상품 금액</span><strong>{formatWon(subtotal)}</strong></div>
        <div className="summary-row"><span>배송비</span><span>{deliveryIsFree ? '무료' : '결제 단계에서 확정'}</span></div>
        {couponDiscount > 0 ? <div className="summary-row discount-row"><span>쿠폰 할인</span><span>−{formatWon(couponDiscount)}</span></div> : null}
        {pointPrice > 0 ? <div className="summary-row discount-row"><span>포인트 사용</span><span>−{formatWon(pointPrice)}</span></div> : null}
        <div className="summary-row summary-total"><span>결제 금액</span><strong>{formatWon(total)}</strong></div>
        {error ? <FormErrorBox style={{ marginTop: 14 }}>{error}</FormErrorBox> : null}
        <button className="button dark full" disabled={pending || !hasAddress} style={{ marginTop: 16 }} type="submit">
          {pending ? '주문 처리 중…' : !hasAddress ? '배송지를 선택해주세요' : `${formatWon(total)} 결제하기`}
        </button>
        <p className="idem-note"><LockIcon /><span><Sentences sentences={idemSentences} /></span></p>
      </aside>
    </form>
  )
}
