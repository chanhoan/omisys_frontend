import Link from 'next/link'

import { Sentences } from '../../../components/sentences'

const sentences = ['삭제되었거나 비공개로 전환된 제품입니다.', '스토어에서 다른 제품을 확인해보세요.'] as const

export default function ProductNotFound() {
  return (
    <section className="empty-page section">
      <p className="eyebrow">NOT FOUND</p>
      <h1>제품을 찾을 수 없습니다</h1>
      <p><Sentences sentences={sentences} /></p>
      <div className="form-actions" style={{ justifyContent: 'center' }}>
        <Link className="button dark" href="/shop">스토어 보기</Link>
        <Link className="button ghost" href="/support">고객지원</Link>
      </div>
    </section>
  )
}
