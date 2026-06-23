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
    expect(screen.getByRole('link', { name: '구매하기' })).toHaveAttribute('href', `/products/${hero.productId}`)
    expect(screen.getByRole('link', { name: /더 알아보기/ })).toHaveAttribute('href', '/shop')
  })
})
