export function ProductCardSkeleton() {
  return (
    <article className="product-card skeleton-card" aria-hidden>
      <div className="product-image-link skeleton-image" />
      <div className="product-copy">
        <div>
          <div className="skeleton skeleton-text short" />
          <div className="skeleton skeleton-text" />
        </div>
        <div className="skeleton skeleton-text short" />
      </div>
    </article>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }, (_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  )
}
