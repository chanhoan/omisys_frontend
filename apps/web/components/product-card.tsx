import type { Product } from '@omi/api'
import { formatWon, getProductBadge } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'

export function ProductCard({ product }: { product: Product }) {
  const badge = getProductBadge(product)
  const href = `/products/${product.productId}`

  return (
    <article className="product-card">
      <Link className="product-image-link" href={href} aria-label={`${product.productName} 상품 보기`}>
        <Image
          alt={`${product.productName} 제품 이미지`}
          className="product-image"
          fill
          sizes="(max-width: 720px) 50vw, 25vw"
          src={product.thumbnailImgUrl}
        />
        {badge ? <span className={`product-badge ${product.soldout ? 'soldout' : ''}`}>{badge}</span> : null}
      </Link>
      <div className="product-copy">
        <div>
          <p className="product-brand">{product.brandName}</p>
          <Link href={href}>{product.productName}</Link>
        </div>
        <div className="product-price">
          <strong>{formatWon(product.discountedPrice)}</strong>
          {product.discountPercent > 0 ? <del>{formatWon(product.originalPrice)}</del> : null}
        </div>
        <div className="product-meta">
          <span>{product.mainColor}</span>
          <span>{product.soldout ? '품절' : `${product.stock}개 남음`}</span>
        </div>
      </div>
    </article>
  )
}
