import type { Metadata } from 'next'
import Link from 'next/link'

import { SearchIcon, WarningTriangleIcon } from '../../components/icons'
import { SearchResultCard } from '../../components/search-result-card'
import { Sentences } from '../../components/sentences'
import { StateBlock } from '../../components/state-block'
import { getSearch } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Search' }

interface SearchPageProps { searchParams: Promise<{ keyword?: string; page?: string }> }

const suggestedTerms = ['니트', '아우터', '와이드 팬츠', '아이보리', '드롭 04', '액세서리']
const emptyResultTerms = ['아우터', '자켓', '코트']
const emptySentences = ['철자를 확인하거나 더 짧은 단어로 검색해보세요.', '추천 검색어로도 둘러볼 수 있습니다.'] as const
const errorSentences = ['일시적인 오류입니다. 잠시 후 다시 시도해주세요.', '문제가 계속되면 고객지원으로 알려주세요.'] as const

function SuggestionLinks({ terms = suggestedTerms, centered = false }: { terms?: readonly string[]; centered?: boolean }) {
  return <div className="search-suggest" style={centered ? { justifyContent: 'center' } : undefined}>{terms.map((term) => <Link href={`/search?keyword=${encodeURIComponent(term)}`} key={term}>{term}</Link>)}</div>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { keyword, page } = await searchParams
  const query = keyword?.trim() ?? ''
  const parsedPage = Number(page)
  const pageNum = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 0
  const results = query ? await getSearch(query, pageNum) : null
  const pageHref = (nextPage: number) => `/search?keyword=${encodeURIComponent(query)}&page=${nextPage}`
  const paginationStart = results ? Math.min(Math.max(pageNum - 1, 0), Math.max(results.totalPages - 3, 0)) : 0
  const paginationPages = results ? Array.from({ length: Math.min(3, results.totalPages) }, (_, index) => paginationStart + index) : []

  return <section className="simple-page section">
    <p className="eyebrow">SEARCH</p>
    <h1>검색.</h1>
    <form action="/search" className="search-form" method="get">
      <label htmlFor="keyword">제품명, 브랜드, 색상으로 검색</label>
      <div><input defaultValue={query} id="keyword" name="keyword" placeholder="예: 니트, 트라우저, 아이보리" type="search" /><button type="submit">검색</button></div>
    </form>
    {!query ? <><p className="eyebrow">추천 검색어</p><SuggestionLinks /><p className="search-hint">색상, 소재, 사이즈로도 검색할 수 있습니다.</p></> : null}
    {query && results === null ? <StateBlock
      action={<div className="form-actions" style={{ justifyContent: 'center' }}><Link className="button dark" href={`/search?keyword=${encodeURIComponent(query)}`}>다시 시도</Link><Link className="button ghost" href="/support">고객지원</Link></div>}
      description={<Sentences sentences={errorSentences} />}
      icon={<WarningTriangleIcon />}
      title="검색 결과를 불러오지 못했습니다"
    /> : null}
    {query && results && results.content.length === 0 ? <StateBlock
      action={<SuggestionLinks centered terms={emptyResultTerms} />}
      description={<Sentences sentences={emptySentences} />}
      icon={<SearchIcon />}
      title={`\u201C${query}\u201D 결과가 없습니다`}
    /> : null}
    {query && results && results.content.length > 0 ? <>
      <p className="search-meta"><b>{query}</b> 검색 결과 <b>{results.totalElements}</b>개</p>
      <div className="product-grid">{results.content.map((item) => <SearchResultCard item={item} key={item.productId} />)}</div>
      {results.totalPages > 1 ? <nav aria-label="페이지" className="pagination">
        {pageNum > 0 ? <Link href={pageHref(pageNum - 1)}>‹</Link> : <a aria-disabled="true">‹</a>}
        {paginationPages.map((paginationPage) => <Link aria-current={paginationPage === pageNum ? 'page' : undefined} href={pageHref(paginationPage)} key={paginationPage}>{paginationPage + 1}</Link>)}
        {pageNum < results.totalPages - 1 ? <Link href={pageHref(pageNum + 1)}>›</Link> : <a aria-disabled="true">›</a>}
      </nav> : null}
    </> : null}
  </section>
}
