import { catalogProducts } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { ProductGrid } from '../components/product-grid'
import { ProductGridSkeleton } from '../components/product-skeleton'
import { ProductShowcase } from '../components/product-showcase'
import { getProducts } from '../lib/server-fetch'

export default async function HomePage() {
  const productPage = await getProducts({ sort: 'newest', size: 4 })
  const featuredProducts = productPage?.content.length
    ? [...productPage.content, ...catalogProducts]
        .filter((product, index, products) => products.findIndex((item) => item.productId === product.productId) === index)
        .slice(0, 3)
    : catalogProducts.slice(0, 3)

  return (
    <>
      <ProductShowcase products={featuredProducts} />

      <section className="section value-strip" aria-label="OMI 서비스">
        <article><strong>무료 배송</strong><span>10만원 이상 주문</span></article>
        <article><strong>간편한 반품</strong><span>수령 후 14일 이내</span></article>
        <article><strong>안전한 결제</strong><span>암호화된 결제 과정</span></article>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">LATEST EDIT</p><h2>새로 나온 제품.</h2></div>
          <Link className="more-link" href="/shop">모두 보기 ›</Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          {productPage && productPage.content.length > 0 ? (
            <ProductGrid products={productPage.content} />
          ) : (
            <ProductGridSkeleton count={4} />
          )}
        </Suspense>
      </section>

      <section className="campaign-split section home-card">
        <div className="campaign-image">
          <Image
            alt="OMI 소재 에디토리얼"
            fill
            sizes="(max-width: 720px) 100vw, 50vw"
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
          />
        </div>
        <div className="campaign-copy">
          <p className="eyebrow">MATERIAL NOTES · 04</p>
          <h2>부드러운 구조.</h2>
          <p>형태는 유지하고 움직임은 방해하지 않는 소재. 이번 에디트의 재킷과 트라우저를 만나보세요.</p>
          <Link className="more-link light-link" href="/shop">에디트 살펴보기 ›</Link>
        </div>
      </section>
    </>
  )
}
