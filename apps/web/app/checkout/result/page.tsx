import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: '주문 완료' }

interface Props {
  searchParams: Promise<{ status?: string; orderId?: string }>
}

export default async function CheckoutResultPage({ searchParams }: Props) {
  const { status, orderId } = await searchParams
  const success = status === 'success'

  return (
    <section className="empty-page section">
      <p className="eyebrow">ORDER</p>
      {success ? (
        <>
          <h1>주문이 완료되었습니다</h1>
          {orderId && <p className="order-id-note">주문번호: #{orderId}</p>}
          <p>주문해 주셔서 감사합니다. 배송 정보는 이메일로 안내드립니다.</p>
          <div className="result-actions">
            <Link className="button dark" href="/account/orders">주문 내역</Link>
            <Link className="button" href="/shop">계속 쇼핑</Link>
          </div>
        </>
      ) : (
        <>
          <h1>주문에 실패했습니다</h1>
          <p>결제 처리 중 문제가 발생했습니다. 다시 시도해 주세요.</p>
          <div className="result-actions">
            <Link className="button dark" href="/cart">장바구니로 돌아가기</Link>
          </div>
        </>
      )}
    </section>
  )
}
