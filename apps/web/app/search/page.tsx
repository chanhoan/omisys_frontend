import type { Metadata } from 'next'

import { SearchResultCard } from '../../components/search-result-card'
import { getSearch } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Search' }

interface SearchPageProps {
  searchParams: Promise<{ keyword?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { keyword, page } = await searchParams
  const query = keyword?.trim() ?? ''
  const pageNum = page ? Number(page) : 0
  const results = query ? await getSearch(query, pageNum) : null

  return (
    <section className="section simple-page">
      <p className="eyebrow">DISCOVER</p>
      <h1>Search</h1>
      <form action="/search" className="search-form" method="get">
        <label htmlFor="keyword">찾고 있는 상품</label>
        <div>
          <input defaultValue={query} id="keyword" name="keyword" placeholder="상품명, 색상, 카테고리" type="search" />
          <button type="submit">Search</button>
        </div>
      </form>
      {query ? (
        results && results.content.length > 0 ? (
          <>
            <div className="section-heading compact"><h2>“{query}” 검색 결과 {results.totalElements}건</h2></div>
            <div className="product-grid">
              {results.content.map((item) => <SearchResultCard item={item} key={item.productId} />)}
            </div>
          </>
        ) : (
          <div className="empty-state"><p>“{query}”에 대한 검색 결과가 없습니다.</p></div>
        )
      ) : (
        <p className="search-hint">키워드를 입력해 상품을 검색하세요.</p>
      )}
    </section>
  )
}
