import Link from 'next/link'

import { getCurrentUser } from '../lib/server-fetch'
import { CartLink } from './cart-link'
import { HeaderSearchIcon } from './icons'
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
      <Link className="wordmark" href="/">OMI</Link>
      <nav className="desktop-nav" aria-label="주요 메뉴">
        {nav.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}
      </nav>
      <nav className="utility-nav" aria-label="사용자 메뉴">
        <Link className="header-icon-link" href="/search" aria-label="검색"><HeaderSearchIcon /></Link>
        <CartLink />
        {user ? (
          <span className="header-user">
            <Link href="/account">{user.nickname ?? user.username}</Link>
            <LogoutButton />
          </span>
        ) : (
          <Link href="/login">로그인</Link>
        )}
      </nav>
    </header>
  )
}
