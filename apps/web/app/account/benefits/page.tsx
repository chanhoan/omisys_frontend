import type { Coupon } from '@omi/api'
import { formatWon } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { ChipFilter } from '../../../components/chip-filter'
import { GateCard } from '../../../components/gate-card'
import { CouponIcon } from '../../../components/icons'
import { StateBlock } from '../../../components/state-block'
import { TierTrack } from '../../../components/tier-track'
import { daysUntil, formatCouponDate } from '../../../lib/format'
import { getCurrentUser, getMyCoupons, getMyPoints, getMyTier } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: '쿠폰 · 포인트' }

interface BenefitsPageProps { searchParams: Promise<{ coupon?: string }> }

const EXPIRING_SOON_DAYS = 7

function couponAmount(coupon: Coupon): string {
  return coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatWon(coupon.discountValue)
}

function couponConditions(coupon: Coupon): string {
  const parts: string[] = []
  if (coupon.minBuyPrice) parts.push(`${formatWon(coupon.minBuyPrice)} 이상`)
  if (coupon.maxDiscountPrice) parts.push(`최대 ${formatWon(coupon.maxDiscountPrice)}`)
  return parts.length > 0 ? parts.join(' · ') : '금액 조건 없음'
}

export default async function BenefitsPage({ searchParams }: BenefitsPageProps) {
  const { coupon: couponTab } = await searchParams
  const [tier, coupons, points, user] = await Promise.all([getMyTier(), getMyCoupons(0), getMyPoints(0), getCurrentUser()])

  if (!user) {
    return (
      <section className="account-section section" style={{ paddingTop: 48 }}>
        <GateCard
          action={<div className="form-actions" style={{ justifyContent: 'center' }}><Link className="button dark" href="/login?next=/account/benefits">로그인</Link><Link className="button ghost" href="/signup">회원가입</Link></div>}
          description="쿠폰, 포인트, 회원 등급은 로그인 후 계정별로 조회합니다."
          title="로그인이 필요합니다"
        />
      </section>
    )
  }

  const allCoupons = coupons?.content ?? []
  const expired = allCoupons.filter((item) => { const left = daysUntil(item.endDate); return left !== null && left < 0 })
  const usable = allCoupons.filter((item) => !expired.includes(item))
  const activeTab = couponTab === 'expired' ? 'expired' : 'usable'
  const visibleCoupons = activeTab === 'expired' ? expired : usable
  const membershipTier = tier?.tier ?? user.tier ?? 'SILVER'
  const pointRows = points?.content ?? []

  return (
    <section className="account-section section">
      <p className="eyebrow">BENEFITS</p>
      <h1>쿠폰 · 포인트.</h1>

      <div className="benefits-summary">
        <div className="benefit-stat"><span>보유 포인트</span><strong>{(user.point ?? 0).toLocaleString('ko-KR')} P</strong></div>
        <div className="benefit-stat"><span>사용 가능 쿠폰</span><strong>{usable.length}장</strong></div>
        <div className="benefit-stat"><span>등급</span><strong>{membershipTier}</strong></div>
      </div>

      <TierTrack tier={membershipTier} />

      <div className="section-heading compact"><h2>쿠폰</h2></div>
      <Suspense fallback={null}>
        <ChipFilter
          items={[{ key: 'usable', label: `사용 가능 ${usable.length}` }, { key: 'expired', label: `기간 만료 ${expired.length}` }]}
          label="쿠폰 필터"
          param="coupon"
        />
      </Suspense>
      {visibleCoupons.length === 0 ? (
        <StateBlock
          action={<Link className="button dark" href="/events">이벤트 보기</Link>}
          description="진행 중인 이벤트에서 쿠폰을 받을 수 있습니다."
          icon={<CouponIcon />}
          style={{ marginTop: 22 }}
          title={activeTab === 'expired' ? '만료된 쿠폰이 없습니다' : '사용할 수 있는 쿠폰이 없습니다'}
        />
      ) : (
        <ul className="coupon-list">
          {visibleCoupons.map((item) => {
            const left = daysUntil(item.endDate)
            const expiringSoon = left !== null && left >= 0 && left <= EXPIRING_SOON_DAYS
            const isExpired = activeTab === 'expired'
            return (
              <li
                className={expiringSoon ? 'coupon-card is-expiring' : 'coupon-card'}
                key={item.couponId}
                style={isExpired ? { opacity: 0.55, borderLeftColor: 'var(--border)' } : undefined}
              >
                <strong>{item.name}</strong>
                <span style={isExpired ? { color: 'var(--text-muted)' } : undefined}>{couponAmount(item)}</span>
                <span className="coupon-min">{couponConditions(item)}</span>
                {item.endDate != null ? (
                  <span className="coupon-expiry">
                    {formatCouponDate(item.endDate)} 만료{expiringSoon ? ` · ${left}일 남음` : ''}
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <div className="section-heading compact"><h2>포인트 내역</h2></div>
      {pointRows.length === 0 ? (
        <StateBlock description="구매하거나 리뷰를 남기면 포인트가 적립됩니다." icon={<CouponIcon />} title="포인트 내역이 없습니다" />
      ) : (
        <ul className="point-list">
          {pointRows.map((entry) => (
            <li className="point-row" key={entry.pointHistoryId}>
              <div className="point-row-body">
                <strong>{entry.type}{entry.orderId ? ` · #${entry.orderId}` : ''}</strong>
              </div>
              <span className={entry.point >= 0 ? 'point-plus' : 'point-minus'}>
                {entry.point >= 0 ? '+' : '−'}{Math.abs(entry.point).toLocaleString('ko-KR')} P
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
