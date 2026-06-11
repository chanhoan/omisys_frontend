# Frontend ↔ Backend 계약 정합 — 잔여 작업 (resume용)

`docs/frontend-add-api.md` 분석에서 도출한 6개 깨짐(B1~B6) 수정 작업 추적 문서.
clear 후 이 문서만으로 이어서 진행 가능하도록 조사 사실을 모두 기록함. (기준일 2026-06-10)

## 브랜치
- **BE**: `../omisys` → `feat/frontend-contract-alignment` (main에서 분기, **B2 + B4(thumbnailImgUrl) 워킹트리, 미커밋**)
- **FE**: `omisys_frontend` → `feat/apple-store-redesign` (현재 작업 브랜치, B1/B5/B6/B3/B4 워킹트리, 미커밋)

## 진행 현황
| # | 항목 | 상태 | 위치 |
|---|---|---|---|
| B1 | 상품상세 `{product,reviews}` 래퍼 | ✅ 완료 | FE: `contracts.ts`(productDetailSchema), `server-fetch.ts`(getProduct) |
| B5 | `GET /api/users/me` email/nickname | ✅ 완료 | FE: `contracts.ts`(userSchema), `account/page.tsx`, `site-header.tsx` |
| B6 | `GET /api/orders/me` totalPrice/orderDate | ✅ 완료 | FE: `contracts.ts`(orderSchema), `account/orders/page.tsx` |
| B2 | `categoryId` 필수 | ✅ BE 수정됨(미커밋) | BE: `ProductSearchController.java` L28 `required=false` |
| B3 | 목록 전용 경량 스키마 | ✅ 완료 (A안: FE-only, stock optional) | FE: `contracts.ts`(productListItemSchema), `catalog.ts`, `product-card/grid/showcase` |
| B4 | cart hydration | ✅ 완료 (B안: FE lean cart + BE 썸네일) | BE: ProductDto/ProductMapper/CartProductResponse · FE: `cart.ts`(CartItemView)/cart-provider/cart·checkout/mobile cart |

> 검증: 전 항목 적용 후 `npm run typecheck`(전 워크스페이스 5개) green. vitest 42 tests(13 파일) 통과 — Node 18.20.8은 vitest 시작 불가라 nvm v20.20.2로 실행. BE `:service:product:product_dto`/`:product:server`/`:order:server` `compileJava` BUILD SUCCESSFUL.

---

## B3 — 목록 전용 경량 스키마 (FE only) ✅ 완료 (A안)

### 문제
- `GET /api/products/search` 는 `Page<ProductSearchDto>` 반환.
- FE `getProducts` 는 `productPageSchema`(`content = productSchema`, full Product)로 파싱 → 필드 부족으로 `safeParse` 실패 → 목록 빈 그리드.

### 사실 (재조사 불필요)
`ProductSearchDto` 실제 필드 (`service/product/.../infrastructure/utils/ProductSearchDto.java`):
`productId, categoryId, productName, brandName, mainColor, size, originalPrice, discountedPrice, discountPercent, description, thumbnailImgUrl, averageRating, isPublic, soldout, tags, reviewCount, salesCount, isDeleted, createdAt`

`productSchema`(full) 대비 **없는 필드**: `stock`, `originImgUrl`, `detailImgUrl`, `limitCountPerUser`.

목록 소비처가 실제 쓰는 필드:
- `product-card.tsx`: thumbnailImgUrl, productName, soldout, brandName, discountedPrice, discountPercent, originalPrice, mainColor, **stock**(`${stock}개 남음`)
- `getProductBadge`(`domain/catalog.ts`): soldout, **stock**(`stock === 0`), discountPercent, tags
- `sortProducts`(`domain/catalog.ts`): discountedPrice, salesCount, createdAt
- → 목록은 `originImgUrl/detailImgUrl/limitCountPerUser` **미사용**. `stock`만 ProductSearchDto에 없는데 사용됨.

(detail 페이지 `app/products/[productId]/page.tsx`는 `originImgUrl` L36, `detailImgUrl` L44, `stock` L64 사용 → full productSchema 유지 필요. B1로 이미 정상.)

### 결정 포인트
`stock` 처리:
- (A) FE만: 목록 lean 스키마에서 `stock` optional → 카드에서 "N개 남음"을 stock 있을 때만 표시.
- (B) BE도: `ProductSearchDto`에 `stock` 추가(`ProductSearchDto` 필드 + `toDto` + ES 재색인) → 목록도 재고 표시.

### 구현 (FE, A안 기준)
1. `packages/api/src/contracts.ts`: `productListItemSchema` 신설 — productSchema에서 `originImgUrl/detailImgUrl/limitCountPerUser` 제거, `stock` optional. `export type ProductListItem`. `productPageSchema.content` 를 이걸로 교체.
2. `lib/server-fetch.ts`: `getProducts` 반환 타입 `ProductPage`(content = ProductListItem) 유지.
3. `components/product-card.tsx` + `product-grid.tsx`: prop 타입 `Product` → `ProductListItem`. `${product.stock}개 남음` 을 `stock != null` 가드.
4. `packages/domain/src/catalog.ts`: `getProductBadge`/`sortProducts` 시그니처 `ProductListItem` 수용(stock optional 가드).
5. 기타 소비처: `product-showcase.tsx`, `app/shop/page.tsx`, `app/page.tsx` 가 목록 결과를 `Product`로 받는지 확인 후 lean 타입으로 교체 (타입 전파 ~5파일).

---

## B4 — cart hydration (BE + FE) ✅ 완료 (B안)

### 문제
- `GET /api/carts` 는 `data` = 평탄 배열 `List<CartProductResponse>`.
- FE `cart-provider.tsx` 는 `data.items`(`[{product:Product, quantity}]`, 중첩 product) 가정 → hydrate 가드 항상 false → 새로고침 시 서버 장바구니 동기화 안 됨(로컬만 동작).

### 사실 (재조사 불필요)
- `CartProductResponse`(`service/order/.../presentation/response/CartProductResponse.java`) 필드: `productId, quantity, name, originalPrice, discountedPrice, discountPercent`. **thumbnailImgUrl 없음, 중첩 product 없음.**
- `CartService.getCart`(`service/order/.../application/service/CartService.java`)는 `productClient.getProductList(ids)` → `List<ProductDto>` → `CartProductResponse.from(product, qty)`.
- `ProductDto`(`service/product/product_dto/.../ProductDto.java`) 필드: `productId, productName, originalPrice, discountedPrice, discountPercent, stock, tags`. **thumbnailImgUrl 없음.** 빌더 위치: `ProductMapper.java`(`service/product/.../application/product/ProductMapper.java`).
- FE cart 모델 `domain/cart.ts` `CartItem = { product: Product, quantity }` — **full Product에 결합**. `cartReducer`가 `limitCountPerUser`(setQuantity 캡), `stock`·`soldout`(add 가드) 사용; `getCartSummary`가 `discountedPrice` 사용. → 평탄 hydration 시 수량변경 `Math.min(qty, undefined)=NaN` 발생.

### 선택지
- **A) BE 대량 enrich**: ProductDto→ProductMapper→CartProductResponse→CartService에 thumbnailImgUrl·limitCountPerUser·soldout 추가. 그래도 categoryId/brandName/mainColor 등 full Product 미충족 → FE가 완전한 Product 못 만듦. 어정쩡.
- **B) FE lean cart 모델 (권장)**: `CartItemView`(productId, name, thumbnailImgUrl, originalPrice, discountedPrice, discountPercent, quantity, +가능시 limitCountPerUser/stock) 신설 → cart를 full Product에서 **분리**. BE는 `thumbnailImgUrl` 1필드만 추가.

### 구현 (B안 기준)
**BE** (`feat/frontend-contract-alignment`):
1. `ProductDto`: `thumbnailImgUrl` 필드 + 빌더 추가.
2. `ProductMapper`: ProductDto 생성 시 `thumbnailImgUrl` 매핑(원본 Product/엔티티에서).
3. `CartProductResponse`: `thumbnailImgUrl` 필드 + `from()` 매핑.

**FE** (`feat/apple-store-redesign`):
4. `packages/domain/src/cart.ts`: `CartItem` → lean `CartItemView` 로 리모델(또는 `CartItem`에 필요한 최소 필드만). reducer/summary 를 lean 필드 기준으로 수정. `add(product)` 는 full Product 받아 lean으로 투영.
5. `packages/api/src/contracts.ts`: `cartBackendSchema` 를 평탄 배열로 — `z.array(z.object({ productId, quantity, name, originalPrice, discountedPrice, discountPercent, thumbnailImgUrl }))`.
6. `components/cart-provider.tsx`: hydrate 가드 `'items' in data.data` 제거 → `data.data`(배열) 직접 매핑 → `CartItemView`. add/setQuantity/remove/clear 의 dispatch payload 를 lean 모델에 맞춤.
7. cart 렌더 소비처(`app/cart/page.tsx`, `components/add-to-cart.tsx`, `cart-link.tsx` 등) lean 모델 필드로 조정.

---

## 미구현(계약문서 only, FE 웹 미호출 — 별도 범위)
- `POST /api/products/batch`, `/api/auth/mobile/*`, `PUT|DELETE /api/users/me/devices/{deviceId}` (모바일/푸시). `docs/frontend-add-api.md §3` 참조.

## 재개 시 체크
- B1~B6 모두 완료. 남은 범위는 §3(모바일/푸시 엔드포인트) — FE 웹 미호출이라 별도 작업.
- 커밋 시 BE(`../omisys`)와 FE 각각 분리 커밋 필요. BE 워킹트리: B2(ProductSearchController) + B4(ProductDto/ProductMapper/CartProductResponse).
- 런타임 재검증: `npm run typecheck` + Node ≥20.12에서 `npx vitest run`(현 환경은 nvm v20.20.2).
- 미해결 가정(런타임 미검증): B1 detail `productSchema`의 `isPublic`/`isDeleted` 키가 Jackson boolean 직렬화(`public`/`deleted`)와 어긋날 가능성 — 실제 `/api/products/detail` 응답으로 확인 권장. (B3 lean 스키마는 해당 boolean 미포함이라 무관)
