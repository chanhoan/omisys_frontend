import '@testing-library/jest-dom/vitest'

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CategoryFilter } from './category-filter'

const navigation = vi.hoisted(() => ({ push: vi.fn(), query: '' }))

vi.mock('next/navigation', () => ({
  usePathname: () => '/shop',
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}))

describe('CategoryFilter', () => {
  afterEach(cleanup)

  beforeEach(() => {
    navigation.push.mockReset()
    navigation.query = 'categoryId=2&sort=price-low&page=3'
  })

  it('renders the selected filters and removes each without retaining the page', () => {
    render(<CategoryFilter categories={[{ categoryId: 2, name: '아우터' }]} currentCategoryId={2} />)

    expect(screen.getByText('적용된 조건')).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '아우터 필터 해제' }))
    expect(navigation.push).toHaveBeenLastCalledWith('/shop?sort=price-low')

    fireEvent.click(screen.getByRole('button', { name: '정렬 초기화' }))
    expect(navigation.push).toHaveBeenLastCalledWith('/shop?categoryId=2')
  })

  it('clears all filters and selects a sort using URL state', () => {
    render(<CategoryFilter categories={[{ categoryId: 2, name: '아우터' }]} currentCategoryId={2} />)

    expect(screen.getByRole('link', { name: '모두 해제' })).toHaveAttribute('href', '/shop')

    fireEvent.click(screen.getByRole('button', { name: '신상품순' }))
    expect(navigation.push).toHaveBeenLastCalledWith('/shop?categoryId=2')
  })
})
