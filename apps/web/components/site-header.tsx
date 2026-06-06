import Link from 'next/link'

import { getCurrentUser } from '../lib/server-fetch'
import { CartLink } from './cart-link'
import { LogoutButton } from './logout-button'

const nav = [
  ['New', '/shop?sort=newest'],
  ['Shop', '/shop'],
  ['Pre-order', '/preorder'],
  ['Events', '/events'],
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
        <Link href="/search" aria-label="검색">Search</Link>
        <Link href="/saved" aria-label="저장한 상품">Saved</Link>
        {user ? (
          <div className="header-user">
            <Link href="/account" aria-label="내 계정">{user.nickname}</Link>
            <LogoutButton />
          </div>
        ) : (
          <Link href="/login" aria-label="로그인">Sign in</Link>
        )}
        <CartLink />
      </nav>
    </header>
  )
}
