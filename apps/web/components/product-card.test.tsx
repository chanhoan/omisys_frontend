import '@testing-library/jest-dom/vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { catalogProducts } from '@omi/domain'
import { afterEach, describe, expect, it } from 'vitest'

import { ProductCard } from './product-card'

describe('ProductCard', () => {
  afterEach(cleanup)

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

  it('does not render a stock slot when the list DTO omits stock', () => {
    const productWithoutStock = { ...catalogProducts[0], stock: undefined }

    render(<ProductCard product={productWithoutStock} />)

    expect(screen.queryByText(/남음/)).not.toBeInTheDocument()
  })
})
