import '@testing-library/jest-dom/vitest'

import { render, screen } from '@testing-library/react'
import { catalogProducts } from '@omi/domain'
import { describe, expect, it } from 'vitest'

import { ProductShowcase } from './product-showcase'

describe('ProductShowcase', () => {
  it('turns featured products into direct product links', () => {
    render(<ProductShowcase products={catalogProducts.slice(0, 3)} />)

    expect(screen.getAllByRole('link', { name: /상품 보기/ })).toHaveLength(3)
    expect(screen.getByText('Night Shirt')).toBeVisible()
    expect(screen.getByText('₩89,000')).toBeVisible()
  })
})
