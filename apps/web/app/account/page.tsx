import type { Metadata } from 'next'
import Link from 'next/link'

import { GateCard } from '../../components/gate-card'
import { LockIcon } from '../../components/icons'
import { LogoutButton } from '../../components/logout-button'
import { Sentences } from '../../components/sentences'
import { TierTrack } from '../../components/tier-track'
import { ToastButton } from '../../components/toast-button'
import { orderGroup } from '../../lib/order-state'
import { getCurrentUser, getMyCoupons, getMyTier, getOrders } from '../../lib/server-fetch'

export const metadata: Metadata = { title: '마이페이지' }

interface AccountPageProps { searchParams: Promise<{ expired?: string }> }

const expiredSentences = ['보안을 위해 일정 시간이 지나면 자동으로 로그아웃됩니다.', '다시 로그인하면 이 페이지로 돌아옵니다.'] as const

const links = [
  { key: 'ORDERS', title: '주문 내역', description: '주문 상태 확인, 취소, 재구매', href: '/account/orders' },
  { key: 'DELIVERIES', title: '배송 조회', description: '운송장 추적과 수령 확인', href: '/account/deliveries' },
  { key: 'BENEFITS', title: '쿠폰 · 포인트', description: '보유 쿠폰과 적립 내역', href: '/account/benefits' },
  { key: 'ADDRESSES', title: '배송지 관리', description: '기본 배송지 설정과 수정', href: '/account/addresses' },
  { key: 'REVIEWS', title: '내 리뷰', description: '작성한 리뷰 확인과 수정', href: '/account/orders' },
  { key: 'SUPPORT', title: '고객지원', description: '문의, 반품, 자주 묻는 질문', href: '/support' },
] as const

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { expired } = await searchParams
  const [user, tier, coupons, orders] = await Promise.all([getCurrentUser(), getMyTier(), getMyCoupons(), getOrders(0)])

  if (expired === '1') {
    return (
      <section className="account-page section" style={{ paddingTop: 48 }}>
        <GateCard
          action={<Link className="button dark" href="/login?next=/account">다시 로그인</Link>}
          description={<Sentences sentences={expiredSentences} />}
          icon={<LockIcon />}
          title="로그인이 만료되었습니다"
        />
      </section>
    )
  }

  if (!user) {
    return (
      <section className="account-page section" style={{ paddingTop: 48 }}>
        <GateCard
          action={<div className="form-actions" style={{ justifyContent: 'center' }}><Link className="button dark" href="/login?next=/account">로그인</Link><Link className="button ghost" href="/signup">회원가입</Link></div>}
          description="주문 내역과 혜택은 회원 계정에서 확인할 수 있습니다."
          title="로그인이 필요합니다"
        />
      </section>
    )
  }

  const displayName = user.nickname ?? user.username
  const membershipTier = tier?.tier ?? user.tier ?? 'SILVER'
  const openOrders = (orders?.content ?? []).filter((order) => {
    const group = orderGroup(order.orderState)
    return group !== null && group !== 'delivered' && group !== 'cancelled'
  }).length

  return (
    <section className="account-page section">
      <div>
        <p className="eyebrow">ACCOUNT</p>
        <h1>마이페이지.</h1>
        <div className="account-hero">
          <span aria-hidden="true" className="account-avatar">{displayName.slice(0, 1)}</span>
          <div>
            <b>{displayName}</b>
            <span className="account-tier">{membershipTier} 등급{user.email ? ` · ${user.email}` : ''}</span>
          </div>
          <Link className="button ghost small" href="/account/addresses" style={{ marginLeft: 'auto' }}>배송지 관리</Link>
        </div>
      </div>

      <div className="benefits-summary">
        <div className="benefit-stat"><span>보유 포인트</span><strong>{(user.point ?? 0).toLocaleString('ko-KR')} P</strong></div>
        <div className="benefit-stat"><span>사용 가능 쿠폰</span><strong>{coupons?.totalElements ?? 0}장</strong></div>
        <div className="benefit-stat"><span>진행 중 주문</span><strong>{openOrders}건</strong></div>
      </div>

      <TierTrack note="등급은 최근 구매 이력을 기준으로 매월 1일 갱신됩니다." tier={membershipTier} />

      <div className="account-grid">
        {links.map((link) => (
          <Link href={link.href} key={link.key}>
            <span>{link.key}</span>
            <h2>{link.title}</h2>
            <p>{link.description}</p>
          </Link>
        ))}
      </div>

      <div className="form-actions" style={{ marginTop: 34 }}>
        <LogoutButton className="button ghost" />
        <ToastButton className="button ghost" label="회원 탈퇴" message="회원 탈퇴는 고객지원으로 문의해주세요." />
      </div>
    </section>
  )
}
