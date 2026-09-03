import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CheckoutForm, getCouponDiscount, getCouponIneligibility, getPointLimit } from './checkout-form'
import { clearQueuedIntent, getQueuedIntent } from './queue-intent-store'

const clear = vi.fn(async () => {})
const push = vi.fn()
const cartState = {
  items: [{ productId: '4c3b9b32-6a4a-4b61-a7a0-83f4c62b1e2a', name: 'Shirt', discountedPrice: 100_000, quantity: 1 }],
}

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('./cart-provider', () => ({ useCart: () => ({ state: cartState, clear }) }))

const ADDRESS = { id: 1, recipient: 'Kim', phoneNumber: '010-0000-0000', zipcode: '12345', address: 'Seoul' }
const PERCENT_COUPON = {
  couponId: 5,
  name: '10% coupon',
  type: 'DISCOUNT',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minBuyPrice: 80_000,
  maxDiscountPrice: 7_000,
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

describe('CheckoutForm', () => {
  beforeEach(() => {
    clear.mockClear()
    push.mockClear()
    clearQueuedIntent()
    vi.stubGlobal('fetch', vi.fn(async () => response({ statusName: 'OK', message: null, data: { orderId: 9 } })))
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'request-key') })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('caps percentage coupons and bounds point use to the discounted order price', () => {
    expect(getCouponDiscount(PERCENT_COUPON, 100_000)).toBe(7_000)
    expect(getCouponDiscount(PERCENT_COUPON, 79_999)).toBe(0)
    expect(getPointLimit(200_000, 93_000)).toBe(93_000)
    expect(getPointLimit(-1, 93_000)).toBe(0)
  })

  it('marks coupons below their threshold or past their end date ineligible', () => {
    expect(getCouponIneligibility(PERCENT_COUPON, 10_000)).toContain('80,000')
    expect(getCouponIneligibility({ ...PERCENT_COUPON, endDate: '2020-01-01' }, 100_000, new Date('2021-01-01'))).toContain('만료')
    expect(getCouponIneligibility({ ...PERCENT_COUPON, minBuyPrice: null, endDate: 'not-a-date' }, 1)).toBeNull()
    expect(getCouponIneligibility({ ...PERCENT_COUPON, minBuyPrice: null, endDate: 20200101 }, 1, new Date('2021-01-01'))).toContain('만료')
  })

  it('calculates uncapped fixed discounts and never discounts more than the order total', () => {
    const fixedCoupon = { ...PERCENT_COUPON, discountType: 'FIXED', discountValue: 20_000, minBuyPrice: null, maxDiscountPrice: null }

    expect(getCouponDiscount(fixedCoupon, 30_000)).toBe(20_000)
    expect(getCouponDiscount({ ...fixedCoupon, discountValue: 40_000 }, 30_000)).toBe(30_000)
    expect(getPointLimit(20_000, 93_000)).toBe(20_000)
  })

  it('sends only eligible selected coupon and bounded points in the order payload', async () => {
    render(<CheckoutForm addresses={[ADDRESS]} availablePoints={4_000} coupons={[PERCENT_COUPON]} />)

    fireEvent.click(screen.getByRole('radio', { name: /10% coupon/i }))
    fireEvent.change(screen.getByRole('textbox', { name: '사용할 포인트' }), { target: { value: '9000' } })
    fireEvent.click(screen.getByRole('button', { name: /결제하기/ }))

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(String(init.body))).toMatchObject({
      pointPrice: 4_000,
      addressId: 1,
      orderProductInfos: [{ productId: cartState.items[0].productId, quantity: 1, userCouponId: 5 }],
    })
    expect(init.headers).toMatchObject({ 'Idempotency-Key': 'request-key' })
    await waitFor(() => expect(clear).toHaveBeenCalledOnce())
  })

  it('keeps the cart and idempotency key when an order request fails, so the shopper can retry', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response({ statusName: 'BAD_REQUEST', message: 'Try again', data: null }, 400))
      .mockResolvedValueOnce(response({ statusName: 'OK', message: null, data: { orderId: 9 } })))
    render(<CheckoutForm addresses={[ADDRESS]} availablePoints={0} coupons={[]} />)

    fireEvent.click(screen.getByRole('button', { name: /결제하기/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Try again')
    expect(clear).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /결제하기/ }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    const [, firstInit] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    const [, secondInit] = vi.mocked(fetch).mock.calls[1] as [string, RequestInit]
    expect(firstInit.headers).toMatchObject({ 'Idempotency-Key': 'request-key' })
    expect(secondInit.headers).toMatchObject({ 'Idempotency-Key': 'request-key' })
  })

  it('keeps the cart when the order response sends the shopper to an external payment step', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({
      statusName: 'OK',
      message: null,
      data: { orderId: 9, checkoutUrl: '#payment-provider' },
    })))
    render(<CheckoutForm addresses={[ADDRESS]} availablePoints={0} coupons={[]} />)

    fireEvent.click(screen.getByRole('button', { name: /결제하기/ }))

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce())
    expect(clear).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('preserves a queued order for replay instead of treating admission as success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => response({
      statusName: 'ACCEPTED',
      message: null,
      data: { state: 'WAITING', rank: 5, retryAfterSeconds: 30 },
    }, 202)))
    render(<CheckoutForm addresses={[ADDRESS]} availablePoints={0} coupons={[]} />)

    fireEvent.click(screen.getByRole('button', { name: /결제하기/ }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/queue'))
    expect(clear).not.toHaveBeenCalled()
    expect(getQueuedIntent()).toMatchObject({
      method: 'POST',
      url: '/api/orders',
      idempotencyKey: 'request-key',
    })
  })

  it('disables checkout without a delivery address', () => {
    render(<CheckoutForm addresses={[]} availablePoints={0} coupons={[]} />)

    expect(screen.getByRole('button', { name: '배송지를 선택해주세요' })).toBeDisabled()
  })

  it('renders an empty-cart recovery action without attempting an order', () => {
    const items = cartState.items
    cartState.items = []
    render(<CheckoutForm addresses={[ADDRESS]} availablePoints={0} coupons={[]} />)

    expect(screen.getByRole('link', { name: '스토어 보기' })).toHaveAttribute('href', '/shop')
    expect(fetch).not.toHaveBeenCalled()
    cartState.items = items
  })

  it('lets a shopper return to no coupon and apply all usable points', () => {
    render(<CheckoutForm addresses={[ADDRESS]} availablePoints={2_000} coupons={[PERCENT_COUPON]} />)

    fireEvent.click(screen.getByRole('radio', { name: /10% coupon/i }))
    fireEvent.click(screen.getByRole('radio', { name: /사용하지 않음/ }))
    fireEvent.click(screen.getByRole('button', { name: '전액 사용' }))

    expect(screen.getByRole('textbox', { name: '사용할 포인트' })).toHaveValue('2000')
    expect(screen.getByText(/이 주문에 최대/)).toHaveTextContent('2,000 P')
  })
})
