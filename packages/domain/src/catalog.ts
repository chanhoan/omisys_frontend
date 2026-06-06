import type { Product } from '@omi/api'

export type CatalogSort = 'newest' | 'price-low' | 'popular'

export function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value)
}

export function getProductBadge(product: Product): string | undefined {
  if (product.soldout || product.stock === 0) return 'SOLD OUT'
  if (product.discountPercent > 0) return `${product.discountPercent}% OFF`
  if (product.tags.includes('NEW')) return 'NEW'
  return product.tags[0]
}

export function sortProducts(products: readonly Product[], sort: CatalogSort): Product[] {
  return [...products].sort((left, right) => {
    if (sort === 'price-low') return left.discountedPrice - right.discountedPrice
    if (sort === 'popular') return right.salesCount - left.salesCount
    return right.createdAt.localeCompare(left.createdAt)
  })
}
