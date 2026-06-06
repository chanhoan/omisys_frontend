import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="wordmark">OMI</p>
        <p>Quiet forms for everyday movement.</p>
      </div>
      <div className="footer-links">
        <Link href="/account/orders">Orders</Link>
        <Link href="/account/addresses">Delivery</Link>
        <Link href="/support">Support</Link>
      </div>
      <p className="footer-meta">© 2026 OMI</p>
    </footer>
  )
}
