import type { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'You' }

export default async function AccountPage() {
  const user = await getCurrentUser()

  return (
    <section className="account-page section">
      <div>
        <p className="eyebrow">MY OMI</p>
        <h1>{user ? user.nickname : 'You'}</h1>
        {user ? (
          <p className="account-tier">{user.tier ?? 'MEMBER'} · {(user.points ?? 0).toLocaleString('ko-KR')} P</p>
        ) : (
          <p>주문과 배송, 혜택을 확인하세요.</p>
        )}
      </div>
      <div className="account-grid">
        {user ? (
          <Link href="/account/orders"><span>01</span><h2>Orders</h2><p>주문 상태와 배송 흐름을 확인합니다.</p></Link>
        ) : (
          <Link href="/login"><span>01</span><h2>Sign in</h2><p>계정에 로그인하거나 새로 가입합니다.</p></Link>
        )}
        <Link href="/account/addresses"><span>02</span><h2>Addresses</h2><p>배송지를 추가하고 기본 주소를 관리합니다.</p></Link>
        <Link href="/account/benefits"><span>03</span><h2>Benefits</h2><p>쿠폰, 포인트, 회원 등급을 확인합니다.</p></Link>
        {user ? <Link href="/account/deliveries"><span>04</span><h2>Deliveries</h2><p>배송 상태와 추적 정보를 확인합니다.</p></Link> : null}
      </div>
    </section>
  )
}
