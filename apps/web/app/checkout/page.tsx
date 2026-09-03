import type { Metadata } from 'next'

import { CheckoutForm } from '../../components/checkout-form'
import { getAddresses, getCurrentUser, getMyCoupons } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const [addresses, coupons, user] = await Promise.all([
    getAddresses(),
    getMyCoupons(),
    getCurrentUser(),
  ])

  return (
    <section className="checkout-page section">
      <p className="eyebrow">CHECKOUT</p>
      <h1>주문.</h1>
      <CheckoutForm
        addresses={addresses ?? []}
        coupons={coupons?.content ?? []}
        availablePoints={user?.point ?? 0}
      />
    </section>
  )
}
