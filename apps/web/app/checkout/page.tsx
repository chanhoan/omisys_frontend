import type { Metadata } from 'next'

import { CheckoutForm } from '../../components/checkout-form'
import { getAddresses } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const addresses = await getAddresses() ?? []

  return (
    <section className="checkout-page section">
      <p className="eyebrow">SECURE CHECKOUT</p>
      <h1>Checkout</h1>
      <CheckoutForm addresses={addresses} />
    </section>
  )
}
