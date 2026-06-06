import '@testing-library/jest-dom/vitest'

import { render, screen } from '@testing-library/react'
import { catalogProducts } from '@omi/domain'
import { describe, expect, it } from 'vitest'

import { ProductCard } from './product-card'

describe('ProductCard', () => {
  it('links product image and name to detail page', () => {
    render(<ProductCard product={catalogProducts[0]} />)

    expect(screen.getByRole('link', { name: /Night Shirt 상품 보기/ })).toHaveAttribute(
      'href',
      `/products/${catalogProducts[0].productId}`,
    )
    expect(screen.getByText('₩89,000')).toBeVisible()
  })

  it('disables purchase affordance for sold-out products', () => {
    render(<ProductCard product={catalogProducts[3]} />)

    expect(screen.getByText('SOLD OUT')).toBeVisible()
    expect(screen.getByText('품절')).toBeVisible()
  })
})
