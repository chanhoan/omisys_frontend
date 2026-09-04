import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TruckIcon } from '../../../../components/icons'
import { Sentences } from '../../../../components/sentences'
import { StateBlock } from '../../../../components/state-block'
import { deliveryBadgeClass, deliveryGroup, deliveryStateLabel } from '../../../../lib/delivery-state'
import { formatStamp } from '../../../../lib/format'
import { getDelivery, getDeliveryTracking } from '../../../../lib/server-fetch'

export const metadata: Metadata = { title: '배송 추적' }

interface DeliveryDetailPageProps { params: Promise<{ deliveryId: string }> }

const emptySentences = ['상품 준비가 완료되면 운송장 번호가 등록됩니다.', '등록 시 알림으로 안내드립니다.'] as const

export default async function DeliveryDetailPage({ params }: DeliveryDetailPageProps) {
  const { deliveryId } = await params
  const id = Number(deliveryId)
  const [delivery, tracking] = await Promise.all([getDelivery(id), getDeliveryTracking(id)])
  if (!delivery) notFound()

  const group = deliveryGroup(delivery.state)
  const history = [...(tracking ?? [])].sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime())
  const latest = history[0]

  return (
    <section className="account-section section">
      <p className="eyebrow">DELIVERY · #{delivery.orderId}</p>
      <h1>배송 추적.</h1>
      <div className="order-detail-meta">
        <span className={deliveryBadgeClass(delivery.state)}>{deliveryStateLabel(delivery.state)}</span>
        {group === 'delivered' && latest ? <span className="muted" style={{ fontSize: 13.5 }}>{formatStamp(latest.occurredAt)} 수령</span> : null}
      </div>

      {delivery.invoiceNumber ? (
        <div className="invoice-card" style={{ marginTop: 0 }}>
          <dl>
            {delivery.courier ? <div><dt>택배사</dt><dd>{delivery.courier}</dd></div> : null}
            <div><dt>운송장 번호</dt><dd>{delivery.invoiceNumber}</dd></div>
            {delivery.recipient ? <div><dt>받는 분</dt><dd>{delivery.recipient}</dd></div> : null}
          </dl>
        </div>
      ) : null}

      {history.length === 0 ? (
        <StateBlock
          action={<Link className="button ghost" href={`/account/orders/${delivery.orderId}`}>주문 상세 보기</Link>}
          description={<Sentences sentences={emptySentences} />}
          icon={<TruckIcon />}
          style={{ marginTop: 20 }}
          title="아직 배송 정보가 없습니다"
        />
      ) : (
        <ol className="track-timeline">
          {history.map((entry, index) => (
            <li className={index === 0 && group !== 'delivered' ? 'track-step is-current' : 'track-step is-done'} key={`${entry.state}-${entry.occurredAt}-${index}`}>
              <span className="track-rail"><span className="track-dot" /></span>
              <div className="track-body">
                <strong>{entry.state}</strong>
                <time>{formatStamp(entry.occurredAt)}</time>
                {entry.memo ? <p>{entry.memo}</p> : null}
              </div>
            </li>
          ))}
          {group !== 'delivered' ? (
            <li className="track-step is-pending">
              <span className="track-rail"><span className="track-dot" /></span>
              <div className="track-body"><strong>배송 완료</strong><time>예정</time></div>
            </li>
          ) : null}
        </ol>
      )}

      {group === 'delivered' ? (
        <div className="form-actions">
          <Link className="button dark" href={`/account/orders/${delivery.orderId}`}>리뷰 작성</Link>
          <Link className="button ghost" href="/support">반품 신청</Link>
        </div>
      ) : null}
    </section>
  )
}
