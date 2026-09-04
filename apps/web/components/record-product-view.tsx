'use client'

import { useEffect } from 'react'

import { rememberViewedProduct } from './recently-viewed-store'

export function RecordProductView({ productId }: { productId: string }) {
  useEffect(() => { rememberViewedProduct(productId) }, [productId])
  return null
}
