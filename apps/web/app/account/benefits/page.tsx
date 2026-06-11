import { formatWon } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser, getMyCoupons, getMyPoints, getMyTier } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: 'Benefits' }

export default async function BenefitsPage() {
  const [tier, coupons, points, user] = await Promise.all([getMyTier(), getMyCoupons(0), getMyPoints(0), getCurrentUser()])

  if (!tier && !coupons && !points && !user) {
    return (
      <section className="empty-page section">
        <p className="eyebrow">MY OMI · BENEFITS</p>
        <h1>Benefits</h1>
        <p>쿠폰, 포인트, 회원 등급은 로그인 후 계정별로 조회합니다.</p>
        <Link className="button dark" href="/login?next=/account/benefits">Sign in</Link>
      </section>
    )
  }

  const pointBalance = user?.point ?? 0

  return (
    <section className="account-section section">
      <p className="eyebrow">MY OMI · BENEFITS</p>
      <h1>Benefits</h1>

      <div className="benefits-summary">
        <div className="benefit-stat"><span>등급</span><strong>{tier?.tier ?? 'MEMBER'}</strong></div>
        <div className="benefit-stat"><span>포인트</span><strong>{pointBalance.toLocaleString('ko-KR')} P</strong></div>
        <div className="benefit-stat"><span>쿠폰</span><strong>{coupons?.totalElements ?? 0}</strong></div>
      </div>

      <div className="section-heading compact"><h2>My coupons</h2></div>
      {coupons && coupons.content.length > 0 ? (
        <ul className="coupon-list">
          {coupons.content.map((coupon) => (
            <li className="coupon-card" key={coupon.couponId}>
              <strong>{coupon.name}</strong>
              <span>{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatWon(coupon.discountValue)} 할인</span>
              {coupon.minBuyPrice ? <span className="coupon-min">{formatWon(coupon.minBuyPrice)} 이상</span> : null}
            </li>
          ))}
        </ul>
      ) : <p className="empty-note">보유한 쿠폰이 없습니다.</p>}

      <div className="section-heading compact"><h2>Point history</h2></div>
      {points && points.content.length > 0 ? (
        <ul className="point-list">
          {points.content.map((entry) => (
            <li className="point-row" key={entry.pointHistoryId}>
              <span>{entry.type}</span>
              <strong className={entry.point >= 0 ? 'point-plus' : 'point-minus'}>
                {entry.point >= 0 ? '+' : ''}{entry.point.toLocaleString('ko-KR')} P
              </strong>
            </li>
          ))}
        </ul>
      ) : <p className="empty-note">포인트 내역이 없습니다.</p>}
    </section>
  )
}
