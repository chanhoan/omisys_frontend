import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="wordmark">OMI</p>
        <p>조용한 형태, 매일의 움직임.</p>
      </div>
      <nav aria-label="푸터 메뉴" className="footer-links">
        <Link href="/shop">스토어</Link>
        <Link href="/support">고객지원</Link>
        <Link href="/support#returns">배송·반품</Link>
        <Link href="/support#terms">이용약관</Link>
      </nav>
      <p className="footer-meta">© 2026 OMI. 사업자등록번호 000-00-00000. 서울특별시 성동구.</p>
    </footer>
  )
}
