'use client'

import type { Category } from '@omi/api'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { CloseIcon } from './icons'

interface CategoryFilterProps { categories: Category[]; currentCategoryId?: number; defaultSort?: 'newest' | 'popular' }

export function CategoryFilter({ categories, currentCategoryId, defaultSort = 'newest' }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') ?? defaultSort
  const selectedCategory = categories.find((category) => category.categoryId === currentCategoryId)
  const hasCategoryFilter = currentCategoryId !== undefined
  const hasSortFilter = currentSort !== defaultSort

  function push(params: URLSearchParams) { const query = params.toString(); router.push(query ? `${pathname}?${query}` : pathname) }
  function selectCategory(categoryId: number | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId === undefined) params.delete('categoryId'); else params.set('categoryId', String(categoryId))
    params.delete('page'); push(params)
  }
  function selectSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === defaultSort) params.delete('sort'); else params.set('sort', sort)
    params.delete('page'); push(params)
  }

  return <>
    <div className="filter-bar" aria-label="카테고리 및 정렬" role="group">
      <button className={!hasCategoryFilter ? 'active' : ''} onClick={() => selectCategory(undefined)} type="button">전체</button>
      {categories.map((category) => <button className={currentCategoryId === category.categoryId ? 'active' : ''} key={category.categoryId} onClick={() => selectCategory(category.categoryId)} type="button">{category.name}</button>)}
      <button className={currentSort === 'popular' ? 'sort-button active' : 'sort-button'} onClick={() => selectSort('popular')} type="button">인기순</button>
      <button className={currentSort === 'newest' ? 'sort-button active' : 'sort-button'} onClick={() => selectSort('newest')} type="button">신상품순</button>
      <button className={currentSort === 'price-low' ? 'sort-button active' : 'sort-button'} onClick={() => selectSort('price-low')} type="button">가격 낮은순</button>
    </div>
    {hasCategoryFilter || hasSortFilter ? <div className="filter-summary">
      <span>적용된 조건</span>
      {hasCategoryFilter ? <FilterTag label={selectedCategory?.name ?? '선택한 카테고리'} onRemove={() => selectCategory(undefined)} removeLabel={`${selectedCategory?.name ?? '카테고리'} 필터 해제`} /> : null}
      {hasSortFilter ? <FilterTag label={currentSort === 'price-low' ? '가격 낮은순' : currentSort === 'popular' ? '인기순' : '신상품순'} onRemove={() => selectSort(defaultSort)} removeLabel="정렬 초기화" /> : null}
      <Link className="more-link" href={pathname} style={{ fontSize: 13 }}>모두 해제</Link>
    </div> : null}
  </>
}

function FilterTag({ label, onRemove, removeLabel }: { label: string; onRemove: () => void; removeLabel: string }) {
  return <span className="filter-tag">{label}<button aria-label={removeLabel} onClick={onRemove} type="button"><CloseIcon /></button></span>
}
