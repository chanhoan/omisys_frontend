import { formatWon } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'

import { CheckIcon, CloseIcon } from '../../../components/icons'
import { ResultRefresher } from '../../../components/result-refresher'
import { Sentences } from '../../../components/sentences'
import { getOrderDetail } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: '주문 완료' }

interface Props {
  searchParams: Promise<{ status?: string; orderId?: string; reason?: string }>
}

const successSentences = ['결제가 정상 처리되었습니다.', '주문 확인 메일을 보냈습니다.'] as const
const failSentences = ['결제가 취소되었거나 승인되지 않았습니다.', '장바구니는 그대로 남아 있으니 다시 시도할 수 있습니다.'] as const
const pendingSentences = ['결제사 응답을 확인하는 중입니다.', '이 화면을 닫지 말아주세요.'] as const

export default async function CheckoutResultPage({ searchParams }: Props) {
  const { status, orderId, reason } = await searchParams
  const numericOrderId = Number(orderId)
  const order = Number.isInteger(numericOrderId) && numericOrderId > 0 ? await getOrderDetail(numericOrderId) : null
  const success = status === 'success'

  // 딥링크 파라미터는 신뢰하지 않는다 — 성공이라고 돌아왔는데 서버에 주문이 아직 없으면 확인 중 화면.
  if (success && orderId && order === null) {
    return (
      <section className="result-page">
        <ResultRefresher />
        <div className="app-spinner" style={{ margin: '0 auto 22px' }} />
        <h1>결제 결과를 확인하고 있습니다</h1>
        <p><Sentences sentences={pendingSentences} /></p>
        <p className="queue-hint">최대 10초가 걸릴 수 있습니다.</p>
      </section>
    )
  }

  if (success) {
    return (
      <section className="result-page">
        <div className="result-mark"><CheckIcon /></div>
        <h1>주문이 완료되었습니다</h1>
        <p><Sentences sentences={successSentences} /></p>
        <dl className="result-card">
          <div><dt>주문번호</dt><dd>#{order?.orderNo ?? orderId ?? '-'}</dd></div>
          {order?.totalRealAmount != null ? <div><dt>결제 금액</dt><dd>{formatWon(order.totalRealAmount)}</dd></div> : null}
          {order?.totalQuantity != null ? <div><dt>주문 수량</dt><dd>{order.totalQuantity}개</dd></div> : null}
          {order?.orderState ? <div><dt>주문 상태</dt><dd><span className={`status-badge status-${order.orderState.toLowerCase()}`}>{order.orderState}</span></dd></div> : null}
        </dl>
        <div className="result-actions">
          <Link className="button dark" href={orderId ? `/account/orders/${orderId}` : '/account/orders'}>주문 상세 보기</Link>
          <Link className="button ghost" href="/shop">계속 쇼핑하기</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="result-page">
      <div className="result-mark is-fail"><CloseIcon /></div>
      <h1>결제가 완료되지 않았습니다</h1>
      <p><Sentences sentences={failSentences} /></p>
      <dl className="result-card">
        {orderId ? <div><dt>주문번호</dt><dd>#{order?.orderNo ?? orderId}</dd></div> : null}
        <div><dt>상태</dt><dd><span className="status-badge status-failed">결제 실패</span></dd></div>
        {reason ? <div><dt>사유</dt><dd>{reason}</dd></div> : null}
      </dl>
      <div className="result-actions">
        <Link className="button dark" href="/checkout">다시 결제하기</Link>
        <Link className="button ghost" href="/cart">장바구니로</Link>
      </div>
    </section>
  )
}
