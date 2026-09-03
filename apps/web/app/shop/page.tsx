import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { CategoryFilter } from '../../components/category-filter'
import { SearchIcon, WarningTriangleIcon } from '../../components/icons'
import { ProductGrid } from '../../components/product-grid'
import { ProductGridSkeleton } from '../../components/product-skeleton'
import { Sentences } from '../../components/sentences'
import { StateBlock } from '../../components/state-block'
import { getCategories, getProducts } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Shop' }

interface ShopPageProps { searchParams: Promise<{ categoryId?: string; sort?: string; page?: string }> }

const emptySentences = ['이 카테고리에 공개된 제품이 아직 없습니다.', '필터를 해제하거나 전체 스토어를 확인해보세요.'] as const
const errorSentences = ['일시적인 오류입니다. 잠시 후 다시 시도해주세요.', '문제가 계속되면 고객지원으로 알려주세요.'] as const

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { categoryId, sort, page } = await searchParams
  const requestedCategoryId = Number(categoryId)
  const categoryIdNum = Number.isInteger(requestedCategoryId) && requestedCategoryId > 0 ? requestedCategoryId : undefined
  const requestedPage = Number(page)
  const pageNum = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 0
  const [productPage, categories] = await Promise.all([getProducts({ categoryId: categoryIdNum, sort: sort ?? 'newest', page: pageNum }), getCategories()])
  const baseQuery = new URLSearchParams({ ...(categoryId ? { categoryId } : {}), ...(sort ? { sort } : {}) })
  const currentHref = `/shop${baseQuery.toString() ? `?${baseQuery.toString()}` : ''}`
  const pageHref = (nextPage: number) => { const params = new URLSearchParams(baseQuery); params.set('page', String(nextPage)); return `/shop?${params.toString()}` }
  const paginationStart = productPage ? Math.min(Math.max(pageNum - 1, 0), Math.max(productPage.totalPages - 3, 0)) : 0
  const paginationPages = productPage ? Array.from({ length: Math.min(3, productPage.totalPages) }, (_, index) => paginationStart + index) : []
  const activeCategory = categories?.find((category) => category.categoryId === categoryIdNum)

  return <section className="listing-page section">
    <div className="listing-title">
      <div>
        <p className="eyebrow">{activeCategory ? `STORE · ${activeCategory.name}` : 'STORE'}</p>
        <h1>{activeCategory ? `${activeCategory.name}.` : '스토어.'}</h1>
      </div>
      {productPage ? <p>{activeCategory ? `${productPage.totalElements}개 제품` : `전체 ${productPage.totalElements}개 제품`}</p> : null}
    </div>
    <Suspense fallback={<ProductGridSkeleton count={1} />}><CategoryFilter categories={categories ?? []} currentCategoryId={categoryIdNum} /></Suspense>
    {productPage === null ? <StateBlock
      action={<div className="form-actions" style={{ justifyContent: 'center' }}><Link className="button dark" href={currentHref}>다시 시도</Link><Link className="button ghost" href="/support">고객지원</Link></div>}
      description={<Sentences sentences={errorSentences} />}
      icon={<WarningTriangleIcon />}
      title="제품을 불러오지 못했습니다"
    />
      : productPage.content.length === 0 ? <StateBlock
        action={<Link className="button dark" href="/shop">전체 스토어 보기</Link>}
        description={<Sentences sentences={emptySentences} />}
        icon={<SearchIcon />}
        title="조건에 맞는 제품이 없습니다"
      />
        : <Suspense fallback={<ProductGridSkeleton />}><ProductGrid products={productPage.content} /></Suspense>}
    {productPage && productPage.totalPages > 1 ? <nav aria-label="페이지" className="pagination">
      {pageNum > 0 ? <Link href={pageHref(pageNum - 1)}>‹</Link> : <a aria-disabled="true">‹</a>}
      {paginationPages.map((paginationPage) => <Link aria-current={paginationPage === pageNum ? 'page' : undefined} href={pageHref(paginationPage)} key={paginationPage}>{paginationPage + 1}</Link>)}
      {pageNum < productPage.totalPages - 1 ? <Link href={pageHref(pageNum + 1)}>›</Link> : <a aria-disabled="true">›</a>}
    </nav> : null}
  </section>
}
