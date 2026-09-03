'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export interface ChipFilterItem { key: string; label: string }

interface ChipFilterProps {
  items: readonly ChipFilterItem[]
  param: string
  label: string
  defaultKey?: string
}

export function ChipFilter({ items, param, label, defaultKey = items[0]?.key ?? '' }: ChipFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get(param) ?? defaultKey

  function select(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === defaultKey) params.delete(param); else params.set(param, key)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div aria-label={label} className="filter-bar" role="group">
      {items.map((item) => (
        <button className={current === item.key ? 'active' : ''} key={item.key} onClick={() => select(item.key)} type="button">
          {item.label}
        </button>
      ))}
    </div>
  )
}
