import type { Metadata } from 'next'
import Link from 'next/link'

import { getMyDeliveries } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: '배송 조회' }

const STATE_LABEL: Record<string, string> = {
  READY_FOR_SHIPMENT: '출고 준비',
  SHIPPING: '배송 중',
  DELIVERED: '배송 완료',
  CANCELED: '취소됨',
}

export default async function DeliveriesPage() {
  const page = await getMyDeliveries(0)
  const deliveries = page?.content ?? []

  return (
    <section className="account-section section">
      <p className="eyebrow">MY OMI · DELIVERY</p>
      <h1>Deliveries</h1>
      {deliveries.length === 0 ? (
        <p className="empty-note">배송 내역이 없습니다.</p>
      ) : (
        <ul className="order-list">
          {deliveries.map((delivery) => (
            <li className="order-card" key={delivery.deliveryId}>
              <div className="order-meta">
                <span className="order-id">주문 #{delivery.orderId}</span>
                <span className={`status-badge status-${delivery.state.toLowerCase()}`}>
                  {STATE_LABEL[delivery.state] ?? delivery.state}
                </span>
              </div>
              {delivery.courier || delivery.invoiceNumber ? (
                <p className="muted">{delivery.courier ?? ''} {delivery.invoiceNumber ?? ''}</p>
              ) : null}
              <Link className="text-link" href={`/account/deliveries/${delivery.deliveryId}`}>배송 추적 →</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
