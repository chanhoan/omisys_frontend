import Link from 'next/link'

import { getCurrentUser } from '../lib/server-fetch'
import { CartLink } from './cart-link'
import { LogoutButton } from './logout-button'

const nav = [
  ['스토어', '/shop'],
  ['신상품', '/shop?sort=newest'],
  ['프리오더', '/preorder'],
  ['이벤트', '/events'],
] as const

export async function SiteHeader() {
  const user = await getCurrentUser()

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="OMI 홈">OMI</Link>
      <nav className="desktop-nav" aria-label="주요 메뉴">
        {nav.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}
      </nav>
      <nav className="utility-nav" aria-label="사용자 메뉴">
        <Link className="header-icon-link" href="/search" aria-label="검색">
          <svg aria-hidden="true" className="header-icon" viewBox="0 0 24 24">
            <circle cx="10.75" cy="10.75" r="6.25" />
            <path d="m15.5 15.5 4 4" />
          </svg>
        </Link>
        <CartLink />
        {user ? (
          <div className="header-user">
            <Link href="/account" aria-label="내 계정">{user.nickname}</Link>
            <LogoutButton />
          </div>
        ) : (
          <Link href="/login" aria-label="로그인">로그인</Link>
        )}
      </nav>
    </header>
  )
}
