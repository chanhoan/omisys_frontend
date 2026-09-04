// 시안(OMI 01 홈 - 로딩)의 스켈레톤 카드. 본문 3줄의 폭은 카드마다 달라 실제 목록처럼 보이게 한다.
const COPY_WIDTHS = [
  ['32%', '72%', '44%'],
  ['32%', '64%', '50%'],
  ['32%', '80%', '40%'],
  ['32%', '58%', '46%'],
] as const

export function ProductCardSkeleton({ variant = 0 }: { variant?: number }) {
  const widths = COPY_WIDTHS[variant % COPY_WIDTHS.length]

  return (
    <article className="product-card" aria-hidden>
      <span className="skeleton product-image-link" />
      <div className="product-copy">
        {widths.map((width, index) => <span className="skeleton-line" key={index} style={{ width }} />)}
      </div>
    </article>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }, (_, index) => <ProductCardSkeleton key={index} variant={index} />)}
    </div>
  )
}

const ORDER_ROWS = [
  ['38%', '22%', '60%', '26%'],
  ['34%', '20%', '52%', '24%'],
  ['40%', '24%', '56%', '22%'],
] as const

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="order-list" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <li className="order-card" key={index}>
          {ORDER_ROWS[index % ORDER_ROWS.length].map((width, line) => (
            <span className="skeleton-line" key={line} style={{ width, marginTop: line === 0 ? undefined : line === 1 ? 10 : 14 }} />
          ))}
        </li>
      ))}
    </ul>
  )
}
