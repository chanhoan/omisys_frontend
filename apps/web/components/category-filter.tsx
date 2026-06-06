'use client'

import type { Category } from '@omi/api'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface CategoryFilterProps {
  categories: Category[]
  currentCategoryId?: number
}

export function CategoryFilter({ categories, currentCategoryId }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function selectCategory(categoryId: number | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId !== undefined) {
      params.set('categoryId', String(categoryId))
    } else {
      params.delete('categoryId')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function selectSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const currentSort = searchParams.get('sort') ?? 'newest'

  return (
    <div className="filter-bar" aria-label="상품 필터">
      <button
        className={currentCategoryId === undefined ? 'active' : ''}
        onClick={() => selectCategory(undefined)}
        type="button"
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          className={currentCategoryId === cat.categoryId ? 'active' : ''}
          key={cat.categoryId}
          onClick={() => selectCategory(cat.categoryId)}
          type="button"
        >
          {cat.name}
        </button>
      ))}
      <button
        className={`sort-button ${currentSort === 'newest' ? 'active' : ''}`}
        onClick={() => selectSort('newest')}
        type="button"
      >
        Newest ↓
      </button>
      <button
        className={`sort-button ${currentSort === 'price-low' ? 'active' : ''}`}
        onClick={() => selectSort('price-low')}
        type="button"
      >
        Price ↑
      </button>
      <button
        className={`sort-button ${currentSort === 'popular' ? 'active' : ''}`}
        onClick={() => selectSort('popular')}
        type="button"
      >
        Popular
      </button>
    </div>
  )
}
