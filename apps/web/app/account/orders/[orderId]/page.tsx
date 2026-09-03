import { formatWon } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Banner } from '../../../../components/banner'
import { AlertIcon, InfoIcon } from '../../../../components/icons'
import { OrderActions } from '../../../../components/order-actions'
import { ReviewForm } from '../../../../components/review-form'
import { Sentences } from '../../../../components/sentences'
import { formatStamp } from '../../../../lib/format'
import { orderBadgeClass, orderGroup, orderStateLabel } from '../../../../lib/order-state'
import { getOrderDetail } from '../../../../lib/server-fetch'

export const metadata: Metadata = { title: '주문 상세' }

interface OrderDetailPageProps { params: Promise<{ orderId: string }> }

const refundSentences = ['환불이 완료되었습니다.', '카드사에 따라 실제 입금까지 3~5 영업일이 걸릴 수 있습니다.'] as const

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params
  const order = await getOrderDetail(Number(orderId))
  if (!order) notFound()
  const group = orderGroup(order.orderState)
  const orderLabel = order.orderNo ?? order.orderId

  return (
    <section className="account-section section">
      <p className="eyebrow">ORDER · #{orderLabel}</p>
      <h1>주문 상세.</h1>
      <div className="order-detail-meta">
        <span className={orderBadgeClass(order.orderState)}>{orderStateLabel(order.orderState)}</span>
        <span className="muted" style={{ fontSize: 13.5 }}>{formatStamp(order.orderDate)} {group === 'pending' ? '주문' : '결제'}</span>
      </div>

      {group === 'pending' ? (
        <Banner icon={<AlertIcon />} tone="warn">
          결제가 완료되지 않은 주문입니다. 기한 내에 결제하지 않으면 자동 취소됩니다.
        </Banner>
      ) : null}
      {group === 'cancelled' ? (
        <Banner icon={<InfoIcon />} tone="info"><Sentences sentences={refundSentences} /></Banner>
      ) : null}

      <div className="order-detail-items">
        {order.orderProducts.map((item) => (
          <div className="order-detail-item" key={item.orderProductId} style={group === 'cancelled' ? { opacity: 0.62 } : undefined}>
            <div>
              <strong style={{ fontSize: 15 }}>{item.productName}</strong>
              <span className="muted" style={{ fontSize: 13 }}>{item.quantity}개</span>
            </div>
            <div className="order-detail-item-right">
              <strong>{formatWon(item.purchasePrice * item.quantity)}</strong>
              {group === 'delivered'
                ? <ReviewForm orderDate={order.orderDate ?? undefined} orderId={order.orderId} productId={item.productId} productName={item.productName} />
                : <Link className="button ghost small" href={`/products/${item.productId}`}>재구매</Link>}
            </div>
          </div>
        ))}
      </div>

      <dl className="order-amounts">
        {order.totalAmount != null ? <div><dt>상품 금액</dt><dd>{formatWon(order.totalAmount)}</dd></div> : null}
        {order.shippingAmount != null ? <div><dt>배송비</dt><dd>{order.shippingAmount === 0 ? '무료' : formatWon(order.shippingAmount)}</dd></div> : null}
        {order.couponPrice ? <div><dt>쿠폰 할인</dt><dd className="is-discount">−{formatWon(order.couponPrice)}</dd></div> : null}
        {order.pointPrice ? <div><dt>포인트 사용</dt><dd className="is-discount">−{formatWon(order.pointPrice)}</dd></div> : null}
        {order.totalRealAmount != null ? (
          <div className="order-summary-total">
            <dt>{group === 'cancelled' ? '환불 금액' : group === 'pending' ? '결제 예정' : '결제 금액'}</dt>
            <dd>{formatWon(order.totalRealAmount)}</dd>
          </div>
        ) : null}
      </dl>

      {order.shippingAddress ? (
        <div className="order-shipping">
          <h2>배송 정보</h2>
          <p><strong>{order.recipient}</strong> · {order.phoneNumber}</p>
          <p className="muted">({order.zipcode}) {order.shippingAddress}</p>
          {order.invoiceNumber ? (
            <div className="invoice-card">
              <dl><div><dt>운송장 번호</dt><dd>{order.invoiceNumber}</dd></div></dl>
              <Link className="button dark" href="/account/deliveries">배송 추적</Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="form-actions" style={{ marginTop: 30 }}>
        {group === 'pending' ? <Link className="button dark" href="/checkout">결제하기</Link> : null}
        <OrderActions orderId={order.orderId} orderNo={order.orderNo} orderState={order.orderState} />
        <Link className="button ghost" href="/support">문의하기</Link>
      </div>
    </section>
  )
}
