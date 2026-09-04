import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { DeliveryStatusFilter } from '../../../components/delivery-status-filter'
import { TruckIcon } from '../../../components/icons'
import { OrderListSkeleton } from '../../../components/product-skeleton'
import { Sentences } from '../../../components/sentences'
import { StateBlock } from '../../../components/state-block'
import { deliveryBadgeClass, deliveryGroup, deliveryStateLabel } from '../../../lib/delivery-state'
import { getMyDeliveries } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: '배송 조회' }

interface DeliveriesPageProps { searchParams: Promise<{ state?: string }> }

const emptySentences = ['주문한 상품이 출고되면 이곳에 표시됩니다.', '운송장이 등록되면 추적할 수 있습니다.'] as const

export default async function DeliveriesPage({ searchParams }: DeliveriesPageProps) {
  const { state } = await searchParams
  const page = await getMyDeliveries(0)
  const all = page?.content ?? []
  const deliveries = state && state !== 'all' ? all.filter((delivery) => deliveryGroup(delivery.state) === state) : all

  return (
    <section className="account-section section">
      <p className="eyebrow">ACCOUNT</p>
      <h1>배송 조회.</h1>
      <Suspense fallback={<OrderListSkeleton count={1} />}><DeliveryStatusFilter /></Suspense>
      {all.length === 0 ? (
        <StateBlock
          action={<Link className="button dark" href="/account/orders">주문 내역 보기</Link>}
          description={<Sentences sentences={emptySentences} />}
          icon={<TruckIcon />}
          title="배송 내역이 없습니다"
        />
      ) : deliveries.length === 0 ? (
        <StateBlock
          action={<Link className="button dark" href="/account/deliveries">전체 배송 보기</Link>}
          description="다른 상태 필터를 선택해보세요."
          icon={<TruckIcon />}
          title="이 상태의 배송이 없습니다"
        />
      ) : (
        <ul className="delivery-list">
          {deliveries.map((delivery) => {
            const trackable = Boolean(delivery.invoiceNumber)
            return (
              <li className="delivery-card" key={delivery.deliveryId}>
                <div className="delivery-card-body">
                  <strong>#{delivery.orderId}</strong>
                  <span>{trackable ? [delivery.courier, delivery.invoiceNumber].filter(Boolean).join(' · ') : '운송장 등록 대기'}</span>
                </div>
                <div className="address-actions">
                  <span className={deliveryBadgeClass(delivery.state)}>{deliveryStateLabel(delivery.state)}</span>
                  {trackable
                    ? <Link className="button ghost small" href={`/account/deliveries/${delivery.deliveryId}`}>추적</Link>
                    : <a aria-disabled="true" className="button ghost small">추적</a>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
