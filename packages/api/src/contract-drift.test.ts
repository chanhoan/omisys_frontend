import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { signUpSchema } from './auth-contracts'
import { KNOWN_SPEC_DEFECTS, compareShape, unwrapZod, type DriftReport } from './contract-drift'
import {
  cartProductResponseSchema,
  categorySchema,
  deliveryDetailSchema,
  deliverySummarySchema,
  eventSchema,
  orderDetailSchema,
  orderSchema,
  preorderSchema,
  productListItemSchema,
  productSchema,
  reviewSchema,
  reviewUpdateSchema,
  searchItemSchema,
  trackingHistorySchema,
  userSchema,
} from './contracts'
import {
  envelopeOf,
  loadSpec,
  requestSchema,
  resolveRef,
  responseSchema,
  unwrapArray,
  unwrapEnvelope,
  unwrapPage,
  type OpenApiDoc,
} from './openapi-spec'

/** 실패 메시지에 어긋난 키가 보이도록 리포트를 통째로 단언한다. */
function expectNoDrift(label: string, report: DriftReport): void {
  expect(report.missingInSpec, `${label}: zod 가 요구하는 키가 스펙에 없습니다`).toEqual([])
  expect(report.typeMismatch, `${label}: JSON 타입이 어긋납니다`).toEqual([])
}

describe('contract drift — 응답 계약', () => {
  it('product detail — ProductDetailResponse.product 가 productSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('product', 'GET', '/api/products/detail/{productId}')
    const product = resolveRef(doc, schema.properties?.product)
    expectNoDrift('product detail', compareShape(productSchema, product, doc))
  })

  it('product list — ProductSearchDto 가 productListItemSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('product', 'GET', '/api/products/search')
    expectNoDrift('product list', compareShape(productListItemSchema, unwrapPage(doc, schema), doc))
  })

  it('search — PageResponseProductSearchDto 가 searchItemSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('search', 'GET', '/api/search')
    expectNoDrift('search', compareShape(searchItemSchema, unwrapPage(doc, schema), doc))
  })

  it('cart — 평탄 배열 CartProductResponse 가 cartProductResponseSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('order', 'GET', '/api/carts')
    expectNoDrift('cart', compareShape(cartProductResponseSchema, unwrapArray(doc, schema), doc))
  })

  it('order list — MyOrderGetResponse 가 orderSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('order', 'GET', '/api/orders/me')
    expectNoDrift('order list', compareShape(orderSchema, unwrapPage(doc, schema), doc))
  })

  it('order detail — OrderGetResponse 가 orderDetailSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('order', 'GET', '/api/orders/{orderId}')
    expectNoDrift('order detail', compareShape(orderDetailSchema, schema, doc))
  })

  it('user me — UserResponse.Info 가 userSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('user', 'GET', '/api/users/me')
    expectNoDrift('user me', compareShape(userSchema, schema, doc))
  })

  it('event detail — EventResponse 가 eventSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('promotion', 'GET', '/api/events/{eventId}')
    expectNoDrift('event detail', compareShape(eventSchema, schema, doc))
  })

  it('preorder detail — PreOrderResponse 가 preorderSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('product', 'GET', '/api/preorders/search/{preOrderId}')
    expectNoDrift('preorder detail', compareShape(preorderSchema, schema, doc))
  })

  it('review list — ReviewResponse.Summary 가 reviewSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('review', 'GET', '/api/reviews')
    expectNoDrift('review list', compareShape(reviewSchema, unwrapPage(doc, schema), doc))
  })

  it('delivery list — DeliveryResponse.MyGet 이 deliverySummarySchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('delivery', 'GET', '/api/deliveries/me')
    expectNoDrift('delivery list', compareShape(deliverySummarySchema, unwrapPage(doc, schema), doc))
  })

  it('delivery detail — DeliveryResponse.Get 이 deliveryDetailSchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('delivery', 'GET', '/api/deliveries/{deliveryId}')
    expectNoDrift('delivery detail', compareShape(deliveryDetailSchema, schema, doc))
  })

  it('tracking — TrackingHistory 가 trackingHistorySchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('delivery', 'GET', '/api/deliveries/{deliveryId}/tracking')
    expectNoDrift('tracking', compareShape(trackingHistorySchema, unwrapArray(doc, schema), doc))
  })

  it('category — CategoryResponse 가 categorySchema 와 일치한다', () => {
    const { doc, schema } = envelopeOf('product', 'GET', '/api/categories/search')
    expectNoDrift('category', compareShape(categorySchema, unwrapArray(doc, schema), doc))
  })
})

describe('contract drift — 요청 계약', () => {
  it('sign-up — UserRequest.Create 가 signUpSchema 와 일치한다', () => {
    const doc = loadSpec('user')
    const body = requestSchema(doc, 'POST', '/api/users/sign-up')
    expectNoDrift('sign-up', compareShape(signUpSchema, body, doc))
  })

  it('order create — OrderCreateRequest 가 checkout-form 이 보내는 본문과 일치한다', () => {
    // `apps/web/components/checkout-form.tsx` 가 실제로 보내는 키 집합.
    // 백엔드에 없는 필드를 추가하면 여기서 잡힌다.
    const checkoutBody = z.object({
      orderType: z.string(),
      orderProductInfos: z.array(
        z.object({
          productId: z.string(),
          quantity: z.number().int(),
          userCouponId: z.number().int().nullable(),
        }),
      ),
      pointPrice: z.number(),
      addressId: z.number().int(),
    })

    const doc = loadSpec('order')
    const body = requestSchema(doc, 'POST', '/api/orders')
    expectNoDrift('order create', compareShape(checkoutBody, body, doc))
  })

  it('review update — ReviewRequest.Update 가 reviewUpdateSchema 와 일치한다', () => {
    const doc = loadSpec('review')
    const body = requestSchema(doc, 'PATCH', '/api/reviews/{reviewId}')
    expectNoDrift('review update', compareShape(reviewUpdateSchema, body, doc))
  })
})

describe('알려진 스펙 결함', () => {
  it('springdoc 이름 충돌 목록이 비어 있지 않다', () => {
    expect(KNOWN_SPEC_DEFECTS.length).toBeGreaterThan(0)
  })

  it('모든 항목에 사유가 적혀 있다', () => {
    for (const defect of KNOWN_SPEC_DEFECTS) {
      expect(defect.reason.length, `${defect.method} ${defect.path}`).toBeGreaterThan(20)
      expect(defect.service.length).toBeGreaterThan(0)
    }
  })
})

describe('스펙 로더', () => {
  it('없는 서비스는 안내와 함께 실패한다', () => {
    expect(() => loadSpec('nosuch')).toThrow(/contracts:sync/)
  })

  it('같은 서비스를 두 번 읽으면 같은 객체를 돌려준다', () => {
    expect(loadSpec('order')).toBe(loadSpec('order'))
  })

  it('없는 오퍼레이션은 실패한다', () => {
    expect(() => responseSchema(loadSpec('order'), 'GET', '/api/nope')).toThrow(/스펙에 없는 오퍼레이션/)
  })

  it('요청 본문이 없는 오퍼레이션은 실패한다', () => {
    expect(() => requestSchema(loadSpec('order'), 'GET', '/api/carts')).toThrow(/요청 본문이 없습니다/)
  })

  it('$ref 가 없는 노드는 그대로 돌려준다', () => {
    const doc = loadSpec('order')
    const node = { type: 'string' }
    expect(resolveRef(doc, node)).toBe(node)
  })

  it('노드가 없으면 실패한다', () => {
    expect(() => resolveRef(loadSpec('order'), undefined)).toThrow(/스키마 노드가 없습니다/)
  })

  it('스펙에 없는 스키마 참조는 실패한다', () => {
    expect(() => resolveRef(loadSpec('order'), { $ref: '#/components/schemas/Nope' })).toThrow(
      /스펙에 없는 스키마/,
    )
  })

  it('components 밖을 가리키는 참조는 실패한다', () => {
    expect(() => resolveRef(loadSpec('order'), { $ref: 'other.json#/Thing' })).toThrow(
      /해석할 수 없는 참조/,
    )
  })

  it('자기참조 스키마도 한 단계만 풀어 무한루프가 없다', () => {
    const { doc, schema } = envelopeOf('product', 'GET', '/api/categories/search')
    const category = unwrapArray(doc, schema)
    const nested = resolveRef(doc, category.properties?.subCategories?.items)
    expect(nested.properties?.categoryId).toBeDefined()
  })

  it('data 속성이 없는 봉투는 실패한다', () => {
    expect(() => unwrapEnvelope(loadSpec('order'), { type: 'object' })).toThrow(/data 속성이 없습니다/)
  })

  it('content 배열이 없는 페이지는 실패한다', () => {
    expect(() => unwrapPage(loadSpec('order'), { type: 'object' })).toThrow(/content 배열이 없습니다/)
  })

  it('배열이 아닌 스키마는 실패한다', () => {
    expect(() => unwrapArray(loadSpec('order'), { type: 'object' })).toThrow(/배열 스키마가 아닙니다/)
  })

  it('200 응답 본문이 없으면 실패한다', () => {
    const doc: OpenApiDoc = {
      paths: { '/api/x': { get: { responses: { 204: {} } } } },
      components: { schemas: {} },
    }
    expect(() => responseSchema(doc, 'GET', '/api/x')).toThrow(/응답 본문이 없습니다/)
  })
})

describe('zod 래퍼 해석', () => {
  it('겹쳐 감싼 래퍼를 벗겨 안쪽 타입을 얻는다', () => {
    const wrapped = z.array(z.string()).nullable().optional()
    expect(unwrapZod(wrapped).safeParse(['a']).success).toBe(true)
    expect(unwrapZod(wrapped).safeParse('a').success).toBe(false)
  })

  it('default 로 감싼 필드는 필수로 보지 않는다', () => {
    const schema = z.object({ tags: z.array(z.string()).default([]) })
    const spec = { type: 'object', properties: {} }
    expect(compareShape(schema, spec, loadSpec('order')).missingInSpec).toEqual([])
  })

  it('coerce 숫자는 스펙이 string 이어도 불일치로 보지 않는다', () => {
    const schema = z.object({ price: z.coerce.number() })
    const spec = { type: 'object', properties: { price: { type: 'string' } } }
    expect(compareShape(schema, spec, loadSpec('order')).typeMismatch).toEqual([])
  })

  it('타입이 실제로 어긋나면 잡아낸다', () => {
    const schema = z.object({ count: z.number() })
    const spec = { type: 'object', properties: { count: { type: 'string' } } }
    expect(compareShape(schema, spec, loadSpec('order')).typeMismatch).toEqual([
      'count: zod number vs spec string',
    ])
  })

  it('판별할 수 없는 종류는 침묵하지 않고 unresolved 에 남긴다', () => {
    const schema = z.object({ mixed: z.union([z.string(), z.number()]) })
    const spec = { type: 'object', properties: { mixed: { type: 'string' } } }
    expect(compareShape(schema, spec, loadSpec('order')).unresolved).toHaveLength(1)
  })

  it('스펙에만 있는 키는 정보성으로 기록한다', () => {
    const schema = z.object({ a: z.string() })
    const spec = { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } }
    expect(compareShape(schema, spec, loadSpec('order')).missingInZod).toEqual(['b'])
  })

  it('$ref 로 된 속성도 타입을 해석한다', () => {
    const doc = loadSpec('order')
    const schema = z.object({ payment: z.object({ paymentId: z.number() }) })
    const spec = { type: 'object', properties: { payment: { $ref: '#/components/schemas/Get' } } }
    expect(compareShape(schema, spec, doc).typeMismatch).toEqual([])
  })

  it('객체가 아닌 스키마는 명시적으로 거부한다', () => {
    expect(() => compareShape(z.array(z.string()), { type: 'array' }, loadSpec('order'))).toThrow(
      /객체 스키마가 아닙니다/,
    )
  })
})

describe('zod 버전 호환', () => {
  /** zod v3 형태(`_def.typeName`)와 판별 불가 형태를 섞은 가짜 객체 스키마. */
  function legacyObject() {
    const rejectUndefined = { safeParse: () => ({ success: false }) }
    return {
      _zod: { def: { type: 'object' } },
      shape: {
        legacy: { ...rejectUndefined, _def: { typeName: 'ZodString' } },
        mystery: { ...rejectUndefined },
      },
    } as unknown as z.ZodTypeAny
  }

  it('v3 형태의 `_def.typeName` 도 종류를 읽어낸다', () => {
    const spec = { type: 'object', properties: { legacy: { type: 'string' }, mystery: { type: 'string' } } }
    const report = compareShape(legacyObject(), spec, loadSpec('order'))

    expect(report.typeMismatch).toEqual([])
    expect(report.missingInSpec).toEqual([])
  })

  it('v3 형태여도 타입이 어긋나면 잡아낸다', () => {
    const spec = { type: 'object', properties: { legacy: { type: 'boolean' }, mystery: { type: 'string' } } }
    const report = compareShape(legacyObject(), spec, loadSpec('order'))

    expect(report.typeMismatch).toEqual(['legacy: zod string vs spec boolean'])
  })

  it('내부 표현을 전혀 읽을 수 없으면 unresolved 에 남긴다', () => {
    const spec = { type: 'object', properties: { legacy: { type: 'string' }, mystery: { type: 'string' } } }
    const report = compareShape(legacyObject(), spec, loadSpec('order'))

    expect(report.unresolved).toEqual(['mystery: zod 종류를 판별하지 못했습니다'])
  })
})

describe('스펙 노드 타입 추론', () => {
  it('type 이 없고 properties 만 있으면 object 로 본다', () => {
    const schema = z.object({ nested: z.object({ a: z.string() }) })
    const spec = { type: 'object', properties: { nested: { properties: { a: { type: 'string' } } } } }

    expect(compareShape(schema, spec, loadSpec('order')).typeMismatch).toEqual([])
  })

  it('type 도 properties 도 없으면 타입 대조를 건너뛴다', () => {
    const schema = z.object({ blank: z.string() })
    const spec = { type: 'object', properties: { blank: {} } }
    const report = compareShape(schema, spec, loadSpec('order'))

    expect(report.typeMismatch).toEqual([])
    expect(report.missingInSpec).toEqual([])
  })
})
