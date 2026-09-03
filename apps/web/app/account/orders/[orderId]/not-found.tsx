import Link from 'next/link'

import { Sentences } from '../../../../components/sentences'

const sentences = ['삭제되었거나 다른 계정의 주문입니다.', '주문 내역에서 다시 확인해주세요.'] as const

export default function OrderNotFound() {
  return (
    <section className="empty-page section">
      <p className="eyebrow">NOT FOUND</p>
      <h1>주문을 찾을 수 없습니다</h1>
      <p><Sentences sentences={sentences} /></p>
      <div className="form-actions" style={{ justifyContent: 'center' }}>
        <Link className="button dark" href="/account/orders">주문 내역</Link>
        <Link className="button ghost" href="/support">고객지원</Link>
      </div>
    </section>
  )
}
