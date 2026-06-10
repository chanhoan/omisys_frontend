import type { ProductListItem } from '@omi/api'
import { formatWon } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'

export function ProductShowcase({ products }: { products: readonly ProductListItem[] }) {
  return (
    <section className="showcase" aria-labelledby="showcase-title">
      <div className="showcase-copy">
        <p className="eyebrow">F/W 2026 · NIGHT SHIFT</p>
        <h1 id="showcase-title">
          <span>이번 계절의</span>
          <span>새로운 균형.</span>
        </h1>
        <p>꾸미지 않은 듯 분명한 실루엣. 지금 가장 먼저 만나보세요.</p>
        <Link className="more-link" href="/shop">신상품 모두 보기 ›</Link>
      </div>
      <div className="showcase-stage" aria-label="주요 신상품">
        {products.slice(0, 3).map((product, index) => (
          <Link
            aria-label={`${product.productName} 상품 보기`}
            className={`showcase-product showcase-product-${index + 1}`}
            href={`/products/${product.productId}`}
            key={product.productId}
          >
            <span className="showcase-image">
              <Image
                alt={`${product.productName} 제품 이미지`}
                fill
                priority={index === 0}
                sizes="(max-width: 720px) 68vw, 28vw"
                src={product.thumbnailImgUrl}
              />
            </span>
            <span className="showcase-meta">
              <span>{product.productName}</span>
              <strong>{formatWon(product.discountedPrice)}</strong>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
