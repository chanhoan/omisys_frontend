import type { SearchItem } from '@omi/api'
import { formatWon } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'

export function SearchResultCard({ item }: { item: SearchItem }) {
  const href = `/products/${item.productId}`

  return (
    <article className="product-card">
      <Link className="product-image-link" href={href} aria-label={`${item.productName} 상품 보기`}>
        {item.thumbnailImgUrl ? (
          <Image
            alt={`${item.productName} 제품 이미지`}
            className="product-image"
            fill
            sizes="(max-width: 720px) 50vw, 25vw"
            src={item.thumbnailImgUrl}
          />
        ) : null}
        {item.soldout ? (
          <span className="product-badge soldout">SOLD OUT</span>
        ) : item.discountPercent > 0 ? (
          <span className="product-badge">{item.discountPercent}% OFF</span>
        ) : null}
      </Link>
      <div className="product-copy">
        <div>
          <p className="product-brand">{item.brandName}</p>
          <Link href={href}>{item.productName}</Link>
        </div>
        <div className="product-price">
          <strong>{formatWon(item.discountedPrice)}</strong>
          {item.discountPercent > 0 ? <del>{formatWon(item.originalPrice)}</del> : null}
        </div>
        <div className="product-meta">
          <span>{item.mainColor}</span>
          <span>★ {item.averageRating.toFixed(1)} ({item.reviewCount})</span>
        </div>
      </div>
    </article>
  )
}
