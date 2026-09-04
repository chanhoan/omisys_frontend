'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ORDER_FILTERS } from '../lib/order-state'

export function OrderStatusFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('state') ?? 'all'

  function select(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'all') params.delete('state'); else params.set('state', key)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div aria-label="주문 상태 필터" className="filter-bar" role="group">
      {ORDER_FILTERS.map((filter) => (
        <button className={current === filter.key ? 'active' : ''} key={filter.key} onClick={() => select(filter.key)} type="button">
          {filter.label}
        </button>
      ))}
    </div>
  )
}
