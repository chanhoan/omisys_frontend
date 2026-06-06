import { z } from 'zod'

export const apiResponseSchema = <T extends z.ZodTypeAny>(data: T) => z.object({
  statusName: z.string(),
  message: z.string().nullable(),
  data,
})

export const productSchema = z.object({
  productId: z.string().uuid(),
  categoryId: z.number().int().positive(),
  brandName: z.string(),
  mainColor: z.string(),
  size: z.string(),
  productName: z.string(),
  originalPrice: z.coerce.number().nonnegative(),
  discountedPrice: z.coerce.number().nonnegative(),
  discountPercent: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  description: z.string(),
  originImgUrl: z.string().url(),
  thumbnailImgUrl: z.string().url(),
  detailImgUrl: z.string().url(),
  limitCountPerUser: z.number().int().positive(),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  salesCount: z.number().int().nonnegative(),
  isPublic: z.boolean(),
  soldout: z.boolean(),
  isDeleted: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.string(),
})

export type Product = z.infer<typeof productSchema>

export const queueResponseSchema = z.object({
  rank: z.number().int().positive(),
  retryAfterSeconds: z.number().int().positive(),
})

export type QueueResponse = z.infer<typeof queueResponseSchema>

export const productPageSchema = z.object({
  content: z.array(productSchema),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  number: z.number().int().nonnegative(),
  size: z.number().int().positive(),
})

export type ProductPage = z.infer<typeof productPageSchema>

export const searchProductSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  price: z.number().nonnegative(),
  brandName: z.string(),
  mainColor: z.string(),
  score: z.number().optional(),
})

export type SearchProduct = z.infer<typeof searchProductSchema>

export const searchPageSchema = z.object({
  content: z.array(searchProductSchema),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  currentPage: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
})

export type SearchPage = z.infer<typeof searchPageSchema>

export const categorySchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string(),
  parentCategoryId: z.number().int().positive().nullable().optional(),
})

export type Category = z.infer<typeof categorySchema>

export const userSchema = z.object({
  userId: z.number().int().positive(),
  username: z.string(),
  email: z.string().email(),
  nickname: z.string(),
  tier: z.string().optional(),
  points: z.number().nonnegative().optional(),
})

export type User = z.infer<typeof userSchema>

export const cartItemBackendSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  product: productSchema,
})

export const cartBackendSchema = z.object({
  items: z.array(cartItemBackendSchema),
})

export type CartBackend = z.infer<typeof cartBackendSchema>

export const addressSchema = z.object({
  addressId: z.number().int().positive(),
  recipientName: z.string(),
  phoneNumber: z.string(),
  zipCode: z.string(),
  address: z.string(),
  addressDetail: z.string().optional(),
})

export type Address = z.infer<typeof addressSchema>

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
})

export const orderSchema = z.object({
  orderId: z.number().int().positive(),
  orderState: z.string(),
  totalPrice: z.number().nonnegative(),
  createdAt: z.string(),
  items: z.array(orderItemSchema).optional(),
})

export type Order = z.infer<typeof orderSchema>

export const orderPageSchema = z.object({
  content: z.array(orderSchema),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  number: z.number().int().nonnegative(),
})

export type OrderPage = z.infer<typeof orderPageSchema>

export const orderCreateResponseSchema = z.object({
  orderId: z.number().int().positive(),
  checkoutUrl: z.string().optional(),
})
