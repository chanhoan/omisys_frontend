import type { ProductListItem } from '@omi/api'

import { ProductCard } from './product-card'

export function ProductGrid({ products }: { products: readonly ProductListItem[] }) {
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.productId} product={product} />)}</div>
}
