import { describe, expect, it } from 'vitest'

import { apiResponseSchema, productSchema, queueResponseSchema } from './contracts'

describe('backend contracts', () => {
  it('accepts an OMISYS product response', () => {
    const product = productSchema.parse({
      productId: '65e26bea-fdb3-4e0c-9fc8-881f478995de',
      categoryId: 1,
      brandName: 'OMI',
      mainColor: 'Black',
      size: 'M',
      productName: 'Night Shirt',
      originalPrice: 99000,
      discountedPrice: 89000,
      discountPercent: 10,
      stock: 12,
      description: 'Drop 04',
      originImgUrl: 'https://images.example.com/origin.jpg',
      thumbnailImgUrl: 'https://images.example.com/thumb.jpg',
      detailImgUrl: 'https://images.example.com/detail.jpg',
      limitCountPerUser: 2,
      averageRating: 4.5,
      reviewCount: 10,
      salesCount: 82,
      isPublic: true,
      soldout: false,
      isDeleted: false,
      tags: ['NEW'],
      createdAt: '2026-06-06T01:00:00',
    })

    expect(product.productName).toBe('Night Shirt')
  })

  it('requires positive queue rank and retry interval', () => {
    expect(() => queueResponseSchema.parse({ rank: 0, retryAfterSeconds: 3 })).toThrow()
    expect(queueResponseSchema.parse({ rank: 5, retryAfterSeconds: 3 })).toEqual({
      rank: 5,
      retryAfterSeconds: 3,
    })
  })

  it('builds a typed API response schema', () => {
    expect(apiResponseSchema(productSchema).parse({
      statusName: 'OK',
      message: null,
      data: {
        productId: '65e26bea-fdb3-4e0c-9fc8-881f478995de',
        categoryId: 1,
        brandName: 'OMI',
        mainColor: 'Black',
        size: 'M',
        productName: 'Night Shirt',
        originalPrice: 99000,
        discountedPrice: 89000,
        discountPercent: 10,
        stock: 12,
        description: 'Drop 04',
        originImgUrl: 'https://images.example.com/origin.jpg',
        thumbnailImgUrl: 'https://images.example.com/thumb.jpg',
        detailImgUrl: 'https://images.example.com/detail.jpg',
        limitCountPerUser: 2,
        averageRating: 4.5,
        reviewCount: 10,
        salesCount: 82,
        isPublic: true,
        soldout: false,
        isDeleted: false,
        tags: ['NEW'],
        createdAt: '2026-06-06T01:00:00',
      },
    }).data.productId).toBe('65e26bea-fdb3-4e0c-9fc8-881f478995de')
  })
})
