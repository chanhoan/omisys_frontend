import { formatDate } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'

import { PreorderButton } from '../../components/preorder-button'
import { getAddresses, getPreorders } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Pre-order' }

export default async function PreorderPage() {
  const [page, addresses] = await Promise.all([getPreorders(0), getAddresses()])
  const preorders = page?.content ?? []
  const defaultAddressId = addresses?.[0]?.id

  if (preorders.length === 0) {
    return (
      <section className="section simple-page">
        <p className="eyebrow">PRE-ORDER</p>
        <h1>Pre-order</h1>
        <div className="empty-state"><p>예정된 사전예약이 없습니다.</p></div>
      </section>
    )
  }

  return (
    <section className="section simple-page">
      <p className="eyebrow">PRE-ORDER · UPCOMING</p>
      <h1>Pre-order</h1>
      <ul className="preorder-list">
        {preorders.map((preorder) => (
          <li className="preorder-card" key={preorder.preOrderId}>
            <div className="preorder-copy">
              <h2><Link href={`/products/${preorder.productId}`}>{preorder.preOrderTitle}</Link></h2>
              <dl className="product-facts">
                <div><dt>Release</dt><dd>{formatDate(preorder.releaseDateTime)}</dd></div>
                <div><dt>Open</dt><dd>{formatDate(preorder.startDateTime)} – {formatDate(preorder.endDateTime)}</dd></div>
                {preorder.availableQuantity != null ? <div><dt>Quantity</dt><dd>{preorder.availableQuantity}</dd></div> : null}
              </dl>
            </div>
            <PreorderButton
              addressId={defaultAddressId}
              open={preorder.state === 'OPEN_FOR_ORDER'}
              preOrderId={preorder.preOrderId}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
