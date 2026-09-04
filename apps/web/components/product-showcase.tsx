import type { ProductListItem } from '@omi/api'
import { formatWon } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'

import { Sentences } from './sentences'

interface ProductShowcaseProps {
  products: readonly ProductListItem[]
  membershipTier?: string
}

const guestSentences = ['형태는 유지하고 움직임은 방해하지 않는 소재.', '이번 시즌 24피스를 먼저 만나보세요.'] as const

export function ProductShowcase({ products, membershipTier }: ProductShowcaseProps) {
  const hero = products[0]
  if (!hero) return null

  const href = `/products/${hero.productId}`
  const isMember = membershipTier !== undefined

  return (
    <section className="showcase" style={isMember ? { minHeight: 0, paddingTop: 44 } : undefined}>
      <div className="showcase-copy">
        <p className="eyebrow">DROP 04 · F/W 2026{isMember ? ' · 회원 선공개' : ''}</p>
        <h1><span>조용한 형태,</span><span>매일의 움직임.</span></h1>
        <p>{isMember ? `${membershipTier} 등급은 드롭 04를 24시간 먼저 구매할 수 있습니다.` : <Sentences sentences={guestSentences} />}</p>
        <div className="showcase-actions">
          <Link className="button dark" href={isMember ? href : '/shop'}>{isMember ? '먼저 구매하기' : '스토어 보기'}</Link>
          <Link className="more-link" href="/shop?sort=newest">드롭 04 살펴보기 ›</Link>
        </div>
      </div>
      <div className="showcase-stage">
        <Link className="showcase-hero" href={href}>
          <span className="showcase-image"><Image alt={hero.productName} fill priority sizes="(max-width: 900px) 90vw, 50vw" src={hero.thumbnailImgUrl} /></span>
          <span className="showcase-meta"><span>{hero.productName}</span><strong>{formatWon(hero.discountedPrice)}</strong></span>
        </Link>
      </div>
    </section>
  )
}
