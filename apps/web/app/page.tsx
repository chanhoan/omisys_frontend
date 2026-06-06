import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { ProductGrid } from '../components/product-grid'
import { ProductGridSkeleton } from '../components/product-skeleton'
import { getProducts } from '../lib/server-fetch'

export default async function HomePage() {
  const productPage = await getProducts({ sort: 'newest', size: 4 })

  return (
    <>
      <section className="hero">
        <Image
          alt="OMI Drop 04 컬렉션"
          fill
          priority
          sizes="100vw"
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90"
        />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">F/W 2026 · NIGHT SHIFT</p>
          <h1>Drop 04</h1>
          <p>새벽의 무드. 절제된 색과 느슨한 실루엣.</p>
          <Link className="button light" href="/shop">Shop the drop <span aria-hidden>→</span></Link>
        </div>
      </section>

      <section className="section editorial-intro">
        <p className="eyebrow">NEW ARRIVALS · 01</p>
        <div>
          <h2>Quiet forms,<br />clear movement.</h2>
          <p>일상에서 오래 머무는 형태를 만듭니다. 과장 없이 선명한 옷, 필요한 만큼의 디테일.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">LATEST EDIT</p><h2>New in</h2></div>
          <Link href="/shop">View all →</Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          {productPage && productPage.content.length > 0 ? (
            <ProductGrid products={productPage.content} />
          ) : (
            <ProductGridSkeleton count={4} />
          )}
        </Suspense>
      </section>

      <section className="campaign-split section">
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
          <h2>Soft structure</h2>
          <p>형태는 유지하고 움직임은 방해하지 않는 소재. 이번 에디트의 재킷과 트라우저를 만나보세요.</p>
          <Link className="text-link" href="/shop">Explore the edit →</Link>
        </div>
      </section>
    </>
  )
}
