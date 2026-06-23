import type { ProductListItem } from '@omi/api'
import { formatWon } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'

export function ProductShowcase({ products }: { products: readonly ProductListItem[] }) {
  const hero = products[0]
  if (!hero) return null

  const href = `/products/${hero.productId}`

  return (
    <section className="showcase" aria-labelledby="showcase-title">
      <div className="showcase-copy">
        <p className="eyebrow">F/W 2026 · NIGHT SHIFT</p>
        <h1 id="showcase-title">
          <span>이번 계절의</span>
          <span>새로운 균형.</span>
        </h1>
        <p>꾸미지 않은 듯 분명한 실루엣. 지금 가장 먼저 만나보세요.</p>
        <div className="showcase-actions">
          <Link className="button dark" href={href}>구매하기</Link>
          <Link className="more-link" href="/shop">더 알아보기 ›</Link>
        </div>
      </div>
      <div className="showcase-stage">
        <Link aria-label={`${hero.productName} 상품 보기`} className="showcase-hero" href={href}>
          <span className="showcase-image">
            <Image
              alt={`${hero.productName} 제품 이미지`}
              fill
              priority
              sizes="(max-width: 900px) 90vw, 50vw"
              src={hero.thumbnailImgUrl}
            />
          </span>
          <span className="showcase-meta">
            <span>{hero.productName}</span>
            <strong>{formatWon(hero.discountedPrice)}</strong>
          </span>
        </Link>
      </div>
    </section>
  )
}
