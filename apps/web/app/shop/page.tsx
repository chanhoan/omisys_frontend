import type { Metadata } from 'next'
import { Suspense } from 'react'

import { CategoryFilter } from '../../components/category-filter'
import { ProductGrid } from '../../components/product-grid'
import { ProductGridSkeleton } from '../../components/product-skeleton'
import { getCategories, getProducts } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Shop' }

interface ShopPageProps {
  searchParams: Promise<{ categoryId?: string; sort?: string; page?: string }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { categoryId, sort, page } = await searchParams
  const categoryIdNum = categoryId ? Number(categoryId) : undefined
  const pageNum = page ? Number(page) : 0

  const [productPage, categories] = await Promise.all([
    getProducts({ categoryId: categoryIdNum, sort: sort ?? 'newest', page: pageNum }),
    getCategories(),
  ])

  return (
    <section className="listing-page section">
      <div className="listing-title">
        <div>
          <p className="eyebrow">ALL PRODUCTS</p>
          <h1>Shop</h1>
        </div>
        <p>{productPage?.totalElements ?? 0} items</p>
      </div>

      <Suspense>
        <CategoryFilter
          categories={categories ?? []}
          currentCategoryId={categoryIdNum}
        />
      </Suspense>

      {productPage && productPage.content.length > 0 ? (
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid products={productPage.content} />
        </Suspense>
      ) : (
        <div className="empty-state">
          <p>상품을 불러오지 못했습니다. 카테고리를 선택하거나 나중에 다시 시도해주세요.</p>
        </div>
      )}

      {productPage && productPage.totalPages > 1 ? (
        <div className="pagination">
          {pageNum > 0 ? (
            <a
              className="button dark"
              href={`/shop?${new URLSearchParams({ ...(categoryId ? { categoryId } : {}), ...(sort ? { sort } : {}), page: String(pageNum - 1) }).toString()}`}
            >
              ← 이전
            </a>
          ) : null}
          <span>{pageNum + 1} / {productPage.totalPages}</span>
          {pageNum < productPage.totalPages - 1 ? (
            <a
              className="button dark"
              href={`/shop?${new URLSearchParams({ ...(categoryId ? { categoryId } : {}), ...(sort ? { sort } : {}), page: String(pageNum + 1) }).toString()}`}
            >
              다음 →
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
