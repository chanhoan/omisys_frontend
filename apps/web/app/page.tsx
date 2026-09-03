import type { Coupon } from '@omi/api'
import { catalogProducts } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { Banner } from '../components/banner'
import { ContinueRail } from '../components/continue-rail'
import { ProductGrid } from '../components/product-grid'
import { ProductGridSkeleton } from '../components/product-skeleton'
import { ProductShowcase } from '../components/product-showcase'
import { ScrollReveal } from '../components/scroll-reveal'
import { Sentences } from '../components/sentences'
import { getCurrentUser, getMyCoupons, getMyTier, getProducts } from '../lib/server-fetch'

const categories = [
  { label: 'OUTERWEAR', title: '겨울 아우터', alt: '겨울 아우터', src: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85' },
  { label: 'KNITWEAR', title: '데일리 니트', alt: '데일리 니트', src: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85' },
  { label: 'ACCESSORIES', title: '마무리 한 끗', alt: '액세서리', src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85' },
] as const

const campaignSentences = ['형태를 지키는 소재.', '이번 에디트에서 만나보세요.'] as const

function parseCouponDate(value: string | number | null | undefined): Date | null {
  if (value == null) return null
  const raw = String(value)
  const normalized = /^\d{8}$/.test(raw) ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : raw
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

/** 시안의 개인화 배너는 "가장 먼저 만료되는 쿠폰"을 알린다. 만료 예정 쿠폰이 없으면 배너를 걸지 않는다. */
export function findExpiringCoupon(coupons: readonly Coupon[], now = new Date()): { coupon: Coupon; daysLeft: number } | null {
  let soonest: { coupon: Coupon; daysLeft: number } | null = null
  for (const coupon of coupons) {
    const endDate = parseCouponDate(coupon.endDate)
    if (endDate === null) continue
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / 86_400_000)
    if (daysLeft < 0 || daysLeft > 30) continue
    if (soonest === null || daysLeft < soonest.daysLeft) soonest = { coupon, daysLeft }
  }
  return soonest
}

function couponAmountLabel(coupon: Coupon): string {
  return coupon.discountType === 'PERCENTAGE'
    ? `${coupon.discountValue}% 쿠폰`
    : `${coupon.discountValue.toLocaleString('ko-KR')}원 쿠폰`
}

export default async function HomePage() {
  const [productPage, user, tier, coupons] = await Promise.all([
    getProducts({ sort: 'newest', size: 4 }), getCurrentUser(), getMyTier(), getMyCoupons(),
  ])
  const membershipTier = tier?.tier ?? user?.tier
  const featuredProducts = productPage?.content.length
    ? [...productPage.content, ...catalogProducts].filter((product, index, products) => products.findIndex((item) => item.productId === product.productId) === index).slice(0, 3)
    : catalogProducts.slice(0, 3)
  const expiring = user ? findExpiringCoupon(coupons?.content ?? []) : null
  const listedProducts = productPage?.content ?? []

  return <>
    {user ? <section className="section" style={{ paddingBottom: 0 }}>
      <div className="benefits-summary" style={{ margin: 0 }}>
        <div className="benefit-stat"><span>등급</span><strong>{membershipTier ?? 'MEMBER'}</strong></div>
        <div className="benefit-stat"><span>포인트</span><strong>{(user.point ?? 0).toLocaleString('ko-KR')} P</strong></div>
        <div className="benefit-stat"><span>사용 가능 쿠폰</span><strong>{coupons?.totalElements ?? 0}</strong></div>
      </div>
      {expiring ? <Banner style={{ marginTop: 16 }} tone="info">
        {membershipTier ?? 'MEMBER'} 등급 전용 <b>{couponAmountLabel(expiring.coupon)}</b>이 {expiring.daysLeft}일 후 만료됩니다.
      </Banner> : null}
    </section> : null}

    <ProductShowcase membershipTier={user ? membershipTier : undefined} products={featuredProducts} />

    <ScrollReveal><section className="section">
      <div className="section-heading"><div><p className="eyebrow">EXPLORE</p><h2>카테고리.</h2></div><Link className="more-link" href="/shop">전체 보기 ›</Link></div>
      <div className="category-tiles">{categories.map((category) => <Link className="category-tile" href="/shop" key={category.label}><Image alt={category.alt} fill sizes="(max-width: 900px) 100vw, 33vw" src={category.src} /><span className="category-tile-label"><span className="eyebrow">{category.label}</span><h2>{category.title}</h2></span></Link>)}</div>
    </section></ScrollReveal>

    <section className="section band-surface">
      <div className="section-heading"><div><p className="eyebrow">{user ? 'CONTINUE' : 'LATEST EDIT'}</p><h2>{user ? '이어서 보기.' : '새로 나온 제품.'}</h2></div><Link className="more-link" href="/shop">모두 보기 ›</Link></div>
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        {listedProducts.length === 0 ? <ProductGridSkeleton count={4} />
          : user ? <ScrollReveal><ContinueRail products={listedProducts} /></ScrollReveal>
            : <ScrollReveal><ProductGrid products={listedProducts} /></ScrollReveal>}
      </Suspense>
    </section>

    <ScrollReveal><section className="campaign-split section home-card">
      <div className="campaign-image"><Image alt="소재 에디토리얼" fill sizes="(max-width: 720px) 100vw, 50vw" src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85" /></div>
      <div className="campaign-copy">
        <p className="eyebrow">MATERIAL NOTES · 04</p>
        <h2>부드러운 구조.</h2>
        <p><Sentences sentences={campaignSentences} /></p>
        <Link className="text-link light-link" href="/shop">에디트 살펴보기 ›</Link>
      </div>
    </section></ScrollReveal>
  </>
}
