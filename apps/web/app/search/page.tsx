import { catalogProducts } from '@omi/domain'
import type { Metadata } from 'next'

import { ProductGrid } from '../../components/product-grid'

export const metadata: Metadata = { title: 'Search' }

export default function SearchPage() {
  return (
    <section className="section simple-page">
      <p className="eyebrow">DISCOVER</p>
      <h1>Search</h1>
      <form className="search-form">
        <label htmlFor="keyword">찾고 있는 상품</label>
        <div><input id="keyword" name="keyword" placeholder="상품명, 색상, 카테고리" type="search" /><button type="submit">Search</button></div>
      </form>
      <div className="section-heading compact"><h2>Trending now</h2></div>
      <ProductGrid products={catalogProducts.slice(0, 2)} />
    </section>
  )
}
