import { cookies } from 'next/headers'
import { z } from 'zod'

import {
  addressSchema,
  apiResponseSchema,
  categorySchema,
  couponPageSchema,
  deliveryDetailSchema,
  deliveryPageSchema,
  eventPageSchema,
  eventSchema,
  orderDetailSchema,
  orderPageSchema,
  pointPageSchema,
  preorderPageSchema,
  preorderSchema,
  productDetailSchema,
  productPageSchema,
  reviewPageSchema,
  searchResultPageSchema,
  trackingHistorySchema,
  userSchema,
  userTierSchema,
  type Address,
  type Category,
  type CouponPage,
  type DeliveryDetail,
  type DeliveryPage,
  type EventItem,
  type EventPage,
  type OrderDetail,
  type OrderPage,
  type PointPage,
  type Preorder,
  type PreorderPage,
  type Product,
  type ProductPage,
  type ReviewPage,
  type SearchResultPage,
  type TrackingHistory,
  type User,
  type UserTier,
} from '@omi/api'

function gateway(): string {
  const url = process.env.OMISYS_GATEWAY_URL
  if (!url) throw new Error('OMISYS_GATEWAY_URL is not configured')
  return url.replace(/\/$/, '')
}

async function serverGet<T>(
  path: string,
  schema: z.ZodType<T>,
  options: { auth?: boolean; revalidate?: number } = {},
): Promise<T | null> {
  try {
    const hdrs: Record<string, string> = {}
    if (options.auth) {
      const cookieStore = await cookies()
      const cookieHeader = cookieStore.toString()
      if (cookieHeader) hdrs.cookie = cookieHeader
    }

    const fetchOptions: RequestInit = { headers: hdrs }
    if (options.revalidate !== undefined) {
      fetchOptions.next = { revalidate: options.revalidate }
    } else {
      fetchOptions.cache = 'no-store'
    }

    const res = await fetch(`${gateway()}${path}`, fetchOptions)
    if (!res.ok) return null

    const json: unknown = await res.json()
    const parsed = apiResponseSchema(schema).safeParse(json)
    if (!parsed.success) return null
    return parsed.data.data
  } catch {
    return null
  }
}

export interface ProductQuery {
  categoryId?: number
  sort?: string
  page?: number
  size?: number
  brandName?: string
  minPrice?: number
  maxPrice?: number
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage | null> {
  const params = new URLSearchParams()
  if (query.categoryId !== undefined) params.set('categoryId', String(query.categoryId))
  if (query.sort) params.set('sort', query.sort)
  if (query.page !== undefined) params.set('page', String(query.page))
  params.set('size', String(query.size ?? 30))
  if (query.brandName) params.set('brandName', query.brandName)
  if (query.minPrice !== undefined) params.set('minPrice', String(query.minPrice))
  if (query.maxPrice !== undefined) params.set('maxPrice', String(query.maxPrice))

  const qs = params.toString()
  return serverGet(`/api/products/search${qs ? `?${qs}` : ''}`, productPageSchema, { revalidate: 60 })
}

export async function getProduct(productId: string): Promise<Product | null> {
  const detail = await serverGet(
    `/api/products/detail/${encodeURIComponent(productId)}`,
    productDetailSchema,
    { revalidate: 60 },
  )
  return detail?.product ?? null
}

export async function getCategories(): Promise<Category[] | null> {
  return serverGet('/api/categories/search', z.array(categorySchema), { revalidate: 300 })
}

export async function getCurrentUser(): Promise<User | null> {
  return serverGet('/api/users/me', userSchema, { auth: true })
}

export async function getAddresses(): Promise<Address[] | null> {
  return serverGet('/api/address/me', z.array(addressSchema), { auth: true })
}

export async function getOrders(page = 0): Promise<OrderPage | null> {
  return serverGet(
    `/api/orders/me?page=${page}&size=10`,
    orderPageSchema,
    { auth: true },
  )
}

export async function getOrderDetail(orderId: number): Promise<OrderDetail | null> {
  return serverGet(`/api/orders/${orderId}`, orderDetailSchema, { auth: true })
}

export async function getSearch(keyword: string, page = 0): Promise<SearchResultPage | null> {
  const params = new URLSearchParams({ keyword, page: String(page), pageSize: '20' })
  return serverGet(`/api/search?${params.toString()}`, searchResultPageSchema)
}

export async function getEvents(page = 0): Promise<EventPage | null> {
  return serverGet(`/api/events?page=${page}&size=12`, eventPageSchema, { revalidate: 60 })
}

export async function getEvent(eventId: number): Promise<EventItem | null> {
  return serverGet(`/api/events/${eventId}`, eventSchema, { revalidate: 60 })
}

export async function getPreorders(page = 0): Promise<PreorderPage | null> {
  return serverGet(`/api/preorders/search?page=${page}&size=12`, preorderPageSchema, { revalidate: 60 })
}

export async function getPreorder(preOrderId: number): Promise<Preorder | null> {
  return serverGet(`/api/preorders/search/${preOrderId}`, preorderSchema, { revalidate: 60 })
}

export async function getMyCoupons(page = 0): Promise<CouponPage | null> {
  return serverGet(`/api/coupons/me?page=${page}&size=20`, couponPageSchema, { auth: true })
}

export async function getMyPoints(page = 0): Promise<PointPage | null> {
  return serverGet(`/api/users/point/me?page=${page}&size=20`, pointPageSchema, { auth: true })
}

export async function getMyTier(): Promise<UserTier | null> {
  return serverGet('/api/users/tier/me', userTierSchema, { auth: true })
}

export async function getReviews(productId: string, page = 0): Promise<ReviewPage | null> {
  return serverGet(
    `/api/reviews?productId=${encodeURIComponent(productId)}&page=${page}&size=20`,
    reviewPageSchema,
    { revalidate: 30 },
  )
}

export async function getMyDeliveries(page = 0): Promise<DeliveryPage | null> {
  return serverGet(`/api/deliveries/me?page=${page}&size=10`, deliveryPageSchema, { auth: true })
}

export async function getDelivery(deliveryId: number): Promise<DeliveryDetail | null> {
  return serverGet(`/api/deliveries/${deliveryId}`, deliveryDetailSchema, { auth: true })
}

export async function getDeliveryTracking(deliveryId: number): Promise<TrackingHistory[] | null> {
  return serverGet(`/api/deliveries/${deliveryId}/tracking`, z.array(trackingHistorySchema), { auth: true })
}
