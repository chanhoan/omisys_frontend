import type { Metadata } from 'next'
import Link from 'next/link'

import { getOrders } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: '주문 내역' }

const STATE_LABEL: Record<string, string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '준비 중',
  SHIPPING: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
}

export default async function OrdersPage() {
  const page = await getOrders(0)
  const orders = page?.content ?? []

  return (
    <section className="account-section section">
      <p className="eyebrow">MY OMI · ORDERS</p>
      <h1>Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-note">
          <p>주문 내역이 없습니다.</p>
          <Link className="button dark" href="/shop">Shop</Link>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <li className="order-card" key={order.orderId}>
              <div className="order-meta">
                <span className="order-id">주문 #{order.orderId}</span>
                <span className={`status-badge status-${order.orderState.toLowerCase()}`}>
                  {STATE_LABEL[order.orderState] ?? order.orderState}
                </span>
              </div>
              <p className="order-date">{new Date(order.orderDate).toLocaleDateString('ko-KR')}</p>
              {order.myOrderProducts.length > 0 && (
                <ul className="order-items-summary">
                  {order.myOrderProducts.map((item) => (
                    <li key={item.productId}>
                      {item.productName} × {item.quantity}
                    </li>
                  ))}
                </ul>
              )}
              <strong className="order-total">
                {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(
                  order.myOrderProducts.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0),
                )}
              </strong>
              <Link className="text-link" href={`/account/orders/${order.orderId}`}>주문 상세 →</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
