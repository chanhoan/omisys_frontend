import { formatWon } from '@omi/domain'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AddToCart } from '../../../components/add-to-cart'
import { getProduct } from '../../../lib/server-fetch'

export const dynamic = 'force-dynamic'

interface ProductPageProps { params: Promise<{ productId: string }> }

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params
  const product = await getProduct(productId)
  return { title: product?.productName ?? 'Product' }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params
  const product = await getProduct(productId)
  if (!product) notFound()

  return (
    <section className="pdp section">
      <div className="pdp-gallery">
        <div className="pdp-image">
          <Image
            alt={`${product.productName} 전체 이미지`}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 60vw"
            src={product.originImgUrl}
          />
        </div>
        <div className="pdp-image detail">
          <Image
            alt={`${product.productName} 상세 이미지`}
            fill
            sizes="(max-width: 900px) 100vw, 60vw"
            src={product.detailImgUrl}
          />
        </div>
      </div>
      <aside className="pdp-info">
        <p className="eyebrow">{product.tags.join(' · ')}</p>
        <h1>{product.productName}</h1>
        <p className="pdp-korean">{product.description}</p>
        <div className="pdp-price">
          <strong>{formatWon(product.discountedPrice)}</strong>
          {product.discountPercent > 0 ? (
            <>
              <span>{product.discountPercent}%</span>
              <del>{formatWon(product.originalPrice)}</del>
            </>
          ) : null}
        </div>
        <dl className="product-facts">
          <div><dt>Color</dt><dd>{product.mainColor}</dd></div>
          <div><dt>Size</dt><dd>{product.size}</dd></div>
          <div><dt>Stock</dt><dd>{product.soldout ? 'Sold out' : `${product.stock} available`}</dd></div>
          <div><dt>Rating</dt><dd>{product.averageRating} / 5 · {product.reviewCount} reviews</dd></div>
        </dl>
        <AddToCart product={product} />
        <div className="pdp-notes">
          <details open><summary>Product notes</summary><p>{product.description}</p></details>
          <details><summary>Delivery &amp; returns</summary><p>결제 완료 후 영업일 기준 2–4일 내 출고됩니다.</p></details>
        </div>
        <Link className="text-link" href="/shop">← Back to shop</Link>
      </aside>
    </section>
  )
}
