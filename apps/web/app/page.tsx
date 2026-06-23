import { catalogProducts } from '@omi/domain'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { ProductGrid } from '../components/product-grid'
import { ProductGridSkeleton } from '../components/product-skeleton'
import { ProductShowcase } from '../components/product-showcase'
import { ScrollReveal } from '../components/scroll-reveal'
import { getProducts } from '../lib/server-fetch'

const categories = [
  {
    label: 'OUTERWEAR',
    title: '겨울 아우터',
    src: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'KNITWEAR',
    title: '데일리 니트',
    src: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85',
  },
  {
    label: 'ACCESSORIES',
    title: '마무리 한 끗',
    src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85',
  },
] as const

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

      <ScrollReveal>
        <section className="section">
          <div className="section-heading">
            <div><p className="eyebrow">EXPLORE</p><h2>카테고리.</h2></div>
            <Link className="more-link" href="/shop">전체 보기 ›</Link>
          </div>
          <div className="category-tiles">
            {categories.map((category) => (
              <Link className="category-tile" href="/shop" key={category.label}>
                <Image alt={`${category.title} 카테고리`} fill sizes="(max-width: 900px) 100vw, 33vw" src={category.src} />
                <span className="category-tile-label">
                  <span className="eyebrow">{category.label}</span>
                  <h2>{category.title}</h2>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <section className="section band-surface">
        <div className="section-heading">
          <div><p className="eyebrow">LATEST EDIT</p><h2>새로 나온 제품.</h2></div>
          <Link className="more-link" href="/shop">모두 보기 ›</Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          {productPage && productPage.content.length > 0 ? (
            <ScrollReveal><ProductGrid products={productPage.content} /></ScrollReveal>
          ) : (
            <ProductGridSkeleton count={4} />
          )}
        </Suspense>
      </section>

      <ScrollReveal>
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
      </ScrollReveal>
    </>
  )
}
