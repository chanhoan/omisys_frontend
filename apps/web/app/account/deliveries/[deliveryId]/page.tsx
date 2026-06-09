import { formatDateTime } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getDelivery, getDeliveryTracking } from '../../../../lib/server-fetch'

export const metadata: Metadata = { title: '배송 추적' }

interface DeliveryDetailPageProps { params: Promise<{ deliveryId: string }> }

export default async function DeliveryDetailPage({ params }: DeliveryDetailPageProps) {
  const { deliveryId } = await params
  const id = Number(deliveryId)
  const [delivery, tracking] = await Promise.all([getDelivery(id), getDeliveryTracking(id)])
  if (!delivery) notFound()
  const history = tracking ?? []

  return (
    <section className="account-section section">
      <p className="eyebrow">MY OMI · TRACKING</p>
      <h1>배송 추적</h1>
      <dl className="product-facts">
        <div><dt>주문</dt><dd>#{delivery.orderId}</dd></div>
        <div><dt>상태</dt><dd>{delivery.state}</dd></div>
        {delivery.courier ? <div><dt>택배사</dt><dd>{delivery.courier}</dd></div> : null}
        {delivery.invoiceNumber ? <div><dt>송장번호</dt><dd>{delivery.invoiceNumber}</dd></div> : null}
      </dl>
      {delivery.shippingAddress ? (
        <p className="muted">{delivery.recipient} · ({delivery.zipcode}) {delivery.shippingAddress}</p>
      ) : null}

      <div className="section-heading compact"><h2>이동 내역</h2></div>
      {history.length === 0 ? (
        <p className="empty-note">등록된 배송 추적 내역이 없습니다.</p>
      ) : (
        <ol className="tracking-timeline">
          {history.map((entry, index) => (
            <li className="tracking-step" key={`${entry.state}-${index}`}>
              <div className="tracking-state">{entry.state}</div>
              {entry.memo ? <p>{entry.memo}</p> : null}
              <time className="muted">{formatDateTime(entry.occurredAt)}</time>
            </li>
          ))}
        </ol>
      )}
      <Link className="button" href="/account/deliveries">← 배송 목록</Link>
    </section>
  )
}
