import '@testing-library/jest-dom/vitest'

import { render, screen } from '@testing-library/react'
import { catalogProducts, formatWon } from '@omi/domain'
import { describe, expect, it } from 'vitest'

import { ProductShowcase } from './product-showcase'

describe('ProductShowcase', () => {
  it('renders the lead product as a single hero with purchase actions', () => {
    render(<ProductShowcase products={catalogProducts.slice(0, 3)} />)
    const hero = catalogProducts[0]

    expect(screen.getByText(hero.productName)).toBeVisible()
    expect(screen.getByText(formatWon(hero.discountedPrice))).toBeVisible()
    expect(screen.getByRole('link', { name: '스토어 보기' })).toHaveAttribute('href', '/shop')
    expect(screen.getByRole('link', { name: /드롭 04 살펴보기/ })).toHaveAttribute('href', '/shop?sort=newest')
  })
})
