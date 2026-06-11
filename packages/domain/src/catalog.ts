import type { ProductListItem } from '@omi/api'

export type CatalogSort = 'newest' | 'price-low' | 'popular'

export function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ko-KR')
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('ko-KR')
}

export function getProductBadge(product: ProductListItem): string | undefined {
  if (product.soldout || product.stock === 0) return 'SOLD OUT'
  if (product.discountPercent > 0) return `${product.discountPercent}% OFF`
  if (product.tags.includes('NEW')) return 'NEW'
  return product.tags[0]
}

export function sortProducts(products: readonly ProductListItem[], sort: CatalogSort): ProductListItem[] {
  return [...products].sort((left, right) => {
    if (sort === 'price-low') return left.discountedPrice - right.discountedPrice
    if (sort === 'popular') return right.salesCount - left.salesCount
    return right.createdAt.localeCompare(left.createdAt)
  })
}
