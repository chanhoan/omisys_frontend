import { formatWon } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { BagIcon } from '../../../components/icons'
import { OrderStatusFilter } from '../../../components/order-status-filter'
import { OrderListSkeleton } from '../../../components/product-skeleton'
import { Sentences } from '../../../components/sentences'
import { StateBlock } from '../../../components/state-block'
import { formatStamp } from '../../../lib/format'
import { orderBadgeClass, orderGroup, orderStateLabel } from '../../../lib/order-state'
import { getOrders } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: '주문 내역' }

interface OrdersPageProps { searchParams: Promise<{ state?: string; page?: string }> }

const emptySentences = ['첫 주문을 하시면 이곳에 표시됩니다.', '배송 상태와 영수증을 확인할 수 있습니다.'] as const

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { state, page } = await searchParams
  const requestedPage = Number(page)
  const pageNum = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 0
  const orderPage = await getOrders(pageNum)
  const allOrders = orderPage?.content ?? []
  const orders = state && state !== 'all' ? allOrders.filter((order) => orderGroup(order.orderState) === state) : allOrders
  const pageHref = (next: number) => `/account/orders?${new URLSearchParams({ ...(state ? { state } : {}), page: String(next) }).toString()}`
  const totalPages = orderPage?.totalPages ?? 0
  const startPage = Math.min(Math.max(pageNum - 1, 0), Math.max(totalPages - 3, 0))
  const pages = Array.from({ length: Math.min(3, totalPages) }, (_, index) => startPage + index)

  return (
    <section className="account-section section">
      <p className="eyebrow">ACCOUNT</p>
      <h1>주문 내역.</h1>
      <Suspense fallback={<OrderListSkeleton count={1} />}><OrderStatusFilter /></Suspense>
      {allOrders.length === 0 ? (
        <StateBlock
          action={<Link className="button dark" href="/shop">스토어 보기</Link>}
          description={<Sentences sentences={emptySentences} />}
          icon={<BagIcon />}
          title="아직 주문이 없습니다"
        />
      ) : orders.length === 0 ? (
        <StateBlock
          action={<Link className="button dark" href="/account/orders">전체 주문 보기</Link>}
          description="다른 상태 필터를 선택해보세요."
          icon={<BagIcon />}
          title="이 상태의 주문이 없습니다"
        />
      ) : (
        <>
          <ul className="order-list">
            {orders.map((order) => {
              const group = orderGroup(order.orderState)
              const total = order.myOrderProducts.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0)
              return (
                <li className="order-card" key={order.orderId}>
                  <div className="order-meta">
                    <span className="order-id">#{order.orderNo ?? order.orderId}</span>
                    <span className={orderBadgeClass(order.orderState)}>{orderStateLabel(order.orderState)}</span>
                  </div>
                  <p className="order-date">{formatStamp(order.orderDate)} {group === 'pending' ? '주문' : '결제'}</p>
                  {order.myOrderProducts.length > 0 ? (
                    <ul className="order-items-summary">
                      {order.myOrderProducts.map((item) => <li key={item.productId}>{item.productName} · {item.quantity}개</li>)}
                    </ul>
                  ) : null}
                  <div className="order-card-foot">
                    <strong className="order-total" style={group === 'cancelled' ? { color: 'var(--text-muted)' } : undefined}>
                      {formatWon(total)}{group === 'cancelled' ? ' 환불 완료' : ''}
                    </strong>
                    <span className="address-actions">
                      {group === 'pending' ? <Link className="button dark small" href="/checkout">결제하기</Link> : null}
                      {group === 'delivered' ? <Link className="button dark small" href={`/account/orders/${order.orderId}`}>리뷰 작성</Link> : null}
                      {group === 'shipping' ? <Link className="button ghost small" href="/account/deliveries">배송 조회</Link> : null}
                      <Link className="button ghost small" href={`/account/orders/${order.orderId}`}>상세 보기</Link>
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
          {totalPages > 1 ? <nav aria-label="페이지" className="pagination">
            {pageNum > 0 ? <Link href={pageHref(pageNum - 1)}>‹</Link> : <a aria-disabled="true">‹</a>}
            {pages.map((value) => <Link aria-current={value === pageNum ? 'page' : undefined} href={pageHref(value)} key={value}>{value + 1}</Link>)}
            {pageNum < totalPages - 1 ? <Link href={pageHref(pageNum + 1)}>›</Link> : <a aria-disabled="true">›</a>}
          </nav> : null}
        </>
      )}
    </section>
  )
}
