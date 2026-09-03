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
  // Lombok `@Getter` on `private boolean isPublic` emits `isPublic()`, and Jackson strips the
  // `is` prefix — the wire keys are `public` / `deleted`, not `isPublic` / `isDeleted`.
  // `soldout` has no prefix to strip, so it stays as-is.
  // SOURCE: ../omisys ProductResponse.java:34,36 · contracts/openapi/product.json ProductResponse
  public: z.boolean(),
  soldout: z.boolean(),
  deleted: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.string(),
})

export type Product = z.infer<typeof productSchema>

// GET /api/products/detail/{id} returns ProductDetailResponse { product, reviews } — a wrapper, not a flat Product.
export const productDetailSchema = z.object({
  product: productSchema,
  reviews: z.unknown(),
})

export type ProductDetail = z.infer<typeof productDetailSchema>

/**
 * Gateway queue protocol. The HTTP status is intentionally not duplicated in
 * this payload: WAITING is returned with 202, READY with 200, and EXPIRED
 * with 410. Consumers must validate both the response status and this
 * discriminated payload at their HTTP boundary.
 */
export const queueWaitingSchema = z.object({
  state: z.literal('WAITING'),
  rank: z.number().int().positive(),
  retryAfterSeconds: z.number().int().positive(),
})

export const queueReadySchema = z.object({
  state: z.literal('READY'),
  rank: z.null(),
  retryAfterSeconds: z.null(),
})

export const queueExpiredSchema = z.object({
  state: z.literal('EXPIRED'),
  rank: z.null(),
  retryAfterSeconds: z.null(),
})

export const queueResponseSchema = z.discriminatedUnion('state', [
  queueWaitingSchema,
  queueReadySchema,
  queueExpiredSchema,
])

export type QueueResponse = z.infer<typeof queueResponseSchema>
export const queueApiResponseSchema = apiResponseSchema(queueResponseSchema)

// GET /api/products/search returns Page<ProductSearchDto> (Elasticsearch projection), not a full Product.
// ProductSearchDto omits stock/originImgUrl/detailImgUrl/limitCountPerUser, so the list uses a lean item.
// stock is list-only optional: the search index does not carry it, so cards show it only when present.
export const productListItemSchema = z.object({
  productId: z.string().uuid(),
  categoryId: z.coerce.number().int().nonnegative(),
  brandName: z.string(),
  mainColor: z.string(),
  productName: z.string(),
  originalPrice: z.coerce.number().nonnegative(),
  discountedPrice: z.coerce.number().nonnegative(),
  discountPercent: z.coerce.number().nonnegative(),
  thumbnailImgUrl: z.string(),
  averageRating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().int().nonnegative(),
  salesCount: z.coerce.number().int().nonnegative(),
  soldout: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  stock: z.number().int().nonnegative().optional(),
})

export type ProductListItem = z.infer<typeof productListItemSchema>

export const productPageSchema = z.object({
  content: z.array(productListItemSchema),
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

// GET /api/users/me returns UserResponse.Info { userId, username, role, point }.
// email/nickname are collected at sign-up but not exposed by the backend, so they are optional here.
export const userSchema = z.object({
  userId: z.number().int().positive(),
  username: z.string(),
  email: z.string().email().optional(),
  nickname: z.string().optional(),
  role: z.string().optional(),
  tier: z.string().optional(),
  point: z.coerce.number().nonnegative().optional(),
})

export type User = z.infer<typeof userSchema>

// GET /api/carts returns a flat List<CartProductResponse> — no nested product, no items wrapper.
// thumbnailImgUrl is added on the backend (ProductDto -> CartProductResponse); kept nullable for safety.
export const cartProductResponseSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().nonnegative(),
  name: z.string(),
  originalPrice: z.coerce.number().nonnegative(),
  discountedPrice: z.coerce.number().nonnegative(),
  discountPercent: z.coerce.number().nonnegative(),
  thumbnailImgUrl: z.string().nullable().optional(),
})

export const cartBackendSchema = z.array(cartProductResponseSchema)

export type CartBackend = z.infer<typeof cartBackendSchema>
export type CartProductResponse = z.infer<typeof cartProductResponseSchema>

export const addressSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive().optional(),
  alias: z.string().nullable().optional(),
  recipient: z.string(),
  phoneNumber: z.string(),
  zipcode: z.string(),
  address: z.string(),
  isDefault: z.boolean().nullable().optional(),
})

export type Address = z.infer<typeof addressSchema>

// GET /api/orders/me content = OrderResponse.MyOrderGetResponse.
// The list DTO has no total price field; date is `orderDate` (not createdAt); line items are `myOrderProducts`.
export const orderItemSchema = z.object({
  orderProductId: z.number().int().optional(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  purchasePrice: z.coerce.number().nonnegative().default(0),
})

export const orderSchema = z.object({
  orderId: z.number().int().positive(),
  orderState: z.string(),
  orderDate: z.string(),
  orderNo: z.string().nullable().optional(),
  orderType: z.string().optional(),
  totalQuantity: z.number().int().nonnegative().optional(),
  invoiceNumber: z.string().nullable().optional(),
  myOrderProducts: z.array(orderItemSchema).default([]),
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

// Spring `Page<T>` envelope (content + paging meta). Unknown fields are ignored.
export const springPage = <T extends z.ZodTypeAny>(item: T) => z.object({
  content: z.array(item),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  number: z.number().int().nonnegative(),
})

// --- Search (Elasticsearch ProductSearchDto + custom PageResponse) ---
export const searchItemSchema = z.object({
  productId: z.string(),
  categoryId: z.number().int().nonnegative(),
  productName: z.string(),
  brandName: z.string(),
  mainColor: z.string(),
  size: z.string().nullable().optional(),
  originalPrice: z.coerce.number().nonnegative(),
  discountedPrice: z.coerce.number().nonnegative(),
  discountPercent: z.coerce.number().nonnegative(),
  thumbnailImgUrl: z.string().nullable().optional(),
  averageRating: z.coerce.number().min(0).max(5),
  soldout: z.boolean(),
  reviewCount: z.coerce.number().int().nonnegative(),
})

export type SearchItem = z.infer<typeof searchItemSchema>

export const searchResultPageSchema = z.object({
  content: z.array(searchItemSchema),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
})

export type SearchResultPage = z.infer<typeof searchResultPageSchema>

// --- Events ---
export const eventSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  imgUrl: z.string().nullable().optional(),
  content: z.string(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
})

export type EventItem = z.infer<typeof eventSchema>
export const eventPageSchema = springPage(eventSchema)
export type EventPage = z.infer<typeof eventPageSchema>

// --- Pre-orders ---
export const preorderSchema = z.object({
  preOrderId: z.number().int(),
  productId: z.string(),
  preOrderTitle: z.string(),
  state: z.string(),
  startDateTime: z.string().nullable().optional(),
  endDateTime: z.string().nullable().optional(),
  releaseDateTime: z.string().nullable().optional(),
  availableQuantity: z.number().int().nullable().optional(),
  // PreOrderResponse 도 같은 Jackson 규칙을 따른다 — 와이어 키는 `public` / `deleted` 다.
  // SOURCE: contracts/openapi/product.json PreOrderResponse
  public: z.boolean().optional(),
  deleted: z.boolean().optional(),
})

export type Preorder = z.infer<typeof preorderSchema>
export const preorderPageSchema = springPage(preorderSchema)
export type PreorderPage = z.infer<typeof preorderPageSchema>

// --- Coupons / Points / Tier (benefits) ---
export const couponSchema = z.object({
  couponId: z.number().int(),
  name: z.string(),
  type: z.string(),
  discountType: z.string(),
  discountValue: z.coerce.number().nonnegative(),
  minBuyPrice: z.coerce.number().nonnegative().nullable().optional(),
  maxDiscountPrice: z.coerce.number().nonnegative().nullable().optional(),
  quantity: z.number().int().nullable().optional(),
  startDate: z.union([z.string(), z.number()]).nullable().optional(),
  endDate: z.union([z.string(), z.number()]).nullable().optional(),
  userTier: z.string().nullable().optional(),
})

export type Coupon = z.infer<typeof couponSchema>
export const couponPageSchema = springPage(couponSchema)
export type CouponPage = z.infer<typeof couponPageSchema>

export const pointSchema = z.object({
  pointHistoryId: z.number().int(),
  userId: z.number().int().optional(),
  orderId: z.number().int().nullable().optional(),
  point: z.coerce.number(),
  type: z.string(),
})

export type PointHistory = z.infer<typeof pointSchema>
export const pointPageSchema = springPage(pointSchema)
export type PointPage = z.infer<typeof pointPageSchema>

export const userTierSchema = z.object({
  userId: z.number().int(),
  username: z.string(),
  tier: z.string(),
})

export type UserTier = z.infer<typeof userTierSchema>

// --- Reviews ---
export const reviewSchema = z.object({
  reviewId: z.number().int(),
  userId: z.number().int(),
  rating: z.number().int().min(0).max(5),
  content: z.string(),
  createdAt: z.string(),
})

export type Review = z.infer<typeof reviewSchema>
export const reviewPageSchema = springPage(reviewSchema)
export type ReviewPage = z.infer<typeof reviewPageSchema>

// PATCH /api/reviews/{reviewId} takes ReviewRequest.Update — rating and content are both required.
// Ownership is enforced server-side (ReviewService.updateReview -> review.validateOwner(userId)),
// so hiding the controls in the UI is a convenience, not a security boundary.
// The spec renders content as `minLength: 0` because springdoc cannot express @NotBlank.
// SOURCE: ../omisys ReviewRequest.java (Update) · contracts/openapi/review.json Update
export const reviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().trim().min(1).max(1000),
})

export type ReviewUpdateRequest = z.infer<typeof reviewUpdateSchema>

// --- Delivery ---
export const deliverySummarySchema = z.object({
  deliveryId: z.number().int(),
  orderId: z.number().int(),
  state: z.string(),
  courier: z.string().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
})

export type DeliverySummary = z.infer<typeof deliverySummarySchema>
export const deliveryPageSchema = springPage(deliverySummarySchema)
export type DeliveryPage = z.infer<typeof deliveryPageSchema>

export const deliveryDetailSchema = z.object({
  deliveryId: z.number().int(),
  orderId: z.number().int(),
  userId: z.number().int().optional(),
  state: z.string(),
  courier: z.string().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
  recipient: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  zipcode: z.string().nullable().optional(),
  shippingAddress: z.string().nullable().optional(),
})

export type DeliveryDetail = z.infer<typeof deliveryDetailSchema>

export const trackingHistorySchema = z.object({
  state: z.string(),
  memo: z.string().nullable().optional(),
  occurredAt: z.string(),
})

export type TrackingHistory = z.infer<typeof trackingHistorySchema>

// --- Order detail (OrderResponse.OrderGetResponse) ---
export const orderProductSchema = z.object({
  orderProductId: z.number().int(),
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  purchasePrice: z.coerce.number().nonnegative(),
})

export const orderDetailSchema = z.object({
  orderId: z.number().int(),
  orderNo: z.string().nullable().optional(),
  orderState: z.string(),
  orderProducts: z.array(orderProductSchema).default([]),
  totalQuantity: z.number().int().nonnegative().optional(),
  totalAmount: z.coerce.number().nonnegative().optional(),
  shippingAmount: z.coerce.number().nonnegative().optional(),
  totalRealAmount: z.coerce.number().nonnegative().optional(),
  pointPrice: z.coerce.number().optional(),
  couponPrice: z.coerce.number().optional(),
  invoiceNumber: z.string().nullable().optional(),
  recipient: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  zipcode: z.string().nullable().optional(),
  shippingAddress: z.string().nullable().optional(),
  orderDate: z.string().nullable().optional(),
})

export type OrderDetail = z.infer<typeof orderDetailSchema>
