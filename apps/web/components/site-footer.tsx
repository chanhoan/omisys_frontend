import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="wordmark">OMI</p>
        <p>일상의 움직임을 위한 조용한 형태.</p>
      </div>
      <div className="footer-links">
        <Link href="/account/orders">주문 조회</Link>
        <Link href="/account/addresses">배송지 관리</Link>
        <Link href="/support">고객 지원</Link>
      </div>
      <p className="footer-meta">© 2026 OMI</p>
    </footer>
  )
}
