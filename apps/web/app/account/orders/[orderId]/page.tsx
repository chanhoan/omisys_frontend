import { formatDateTime, formatWon } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { OrderActions } from '../../../../components/order-actions'
import { ReviewForm } from '../../../../components/review-form'
import { getOrderDetail } from '../../../../lib/server-fetch'

export const metadata: Metadata = { title: '주문 상세' }

interface OrderDetailPageProps { params: Promise<{ orderId: string }> }

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params
  const order = await getOrderDetail(Number(orderId))
  if (!order) notFound()

  return (
    <section className="account-section section">
      <p className="eyebrow">MY OMI · ORDER</p>
      <h1>주문 #{order.orderNo ?? order.orderId}</h1>
      <div className="order-detail-meta">
        <span className={`status-badge status-${order.orderState.toLowerCase()}`}>{order.orderState}</span>
        <span className="muted">{formatDateTime(order.orderDate)}</span>
      </div>

      <ul className="order-detail-items">
        {order.orderProducts.map((item) => (
          <li className="order-detail-item" key={item.orderProductId}>
            <div>
              <Link href={`/products/${item.productId}`}>{item.productName}</Link>
              <span className="muted"> × {item.quantity}</span>
            </div>
            <div className="order-detail-item-right">
              <strong>{formatWon(item.purchasePrice)}</strong>
              <ReviewForm orderId={order.orderId} productId={item.productId} />
            </div>
          </li>
        ))}
      </ul>

      <dl className="order-summary">
        {order.totalAmount != null ? <div><dt>상품 금액</dt><dd>{formatWon(order.totalAmount)}</dd></div> : null}
        {order.shippingAmount != null ? <div><dt>배송비</dt><dd>{formatWon(order.shippingAmount)}</dd></div> : null}
        {order.couponPrice ? <div><dt>쿠폰 할인</dt><dd>-{formatWon(order.couponPrice)}</dd></div> : null}
        {order.pointPrice ? <div><dt>포인트 사용</dt><dd>-{formatWon(order.pointPrice)}</dd></div> : null}
        {order.totalRealAmount != null ? (
          <div className="order-summary-total"><dt>결제 금액</dt><dd>{formatWon(order.totalRealAmount)}</dd></div>
        ) : null}
      </dl>

      {order.shippingAddress ? (
        <div className="order-shipping">
          <h2>배송지</h2>
          <p>{order.recipient} · {order.phoneNumber}</p>
          <p>({order.zipcode}) {order.shippingAddress}</p>
          {order.invoiceNumber ? <p className="muted">송장번호 {order.invoiceNumber}</p> : null}
        </div>
      ) : null}

      <div className="form-actions">
        <OrderActions orderId={order.orderId} orderState={order.orderState} />
        <Link className="button" href="/account/orders">← 주문 목록</Link>
      </div>
    </section>
  )
}
