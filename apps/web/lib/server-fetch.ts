import { cookies } from 'next/headers'
import { z } from 'zod'

import {
  addressSchema,
  apiResponseSchema,
  categorySchema,
  orderPageSchema,
  productPageSchema,
  productSchema,
  userSchema,
  type Address,
  type Category,
  type Order,
  type OrderPage,
  type Product,
  type ProductPage,
  type User,
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
  return serverGet(`/api/products/detail/${encodeURIComponent(productId)}`, productSchema, {
    revalidate: 60,
  })
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

export async function getOrderDetail(orderId: number): Promise<Order | null> {
  const orderDetailSchema = z.object({
    orderId: z.number().int().positive(),
    orderState: z.string(),
    totalPrice: z.number().nonnegative(),
    createdAt: z.string(),
    items: z.array(
      z.object({
        productId: z.string().uuid(),
        productName: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().nonnegative(),
      }),
    ).optional(),
  })
  return serverGet(`/api/orders/${orderId}`, orderDetailSchema, { auth: true })
}
