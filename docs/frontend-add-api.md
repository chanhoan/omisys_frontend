# Frontend 임의 추가 API / 계약 항목

OMISYS 백엔드 컨트롤러를 전수 추출해 omisys_frontend 가 실제 호출/기대하는 계약과 대조한 결과입니다.
아래 항목은 **프론트엔드가 백엔드 근거 없이 임의로 추가하거나 가정한 요청 필드·헤더·응답 형태**입니다.
(백엔드 라우팅은 path rewrite 없이 `/api/...` 를 그대로 서비스로 전달합니다. 대조 기준일: 2026-06-10)

분류:
- **REQUEST 추가**: FE가 보내지만 백엔드 DTO/핸들러에 없는 필드·헤더 → 현재는 조용히 무시됨(무해), 향후 백엔드 구현 필요 시 명시.
- **RESPONSE 가정**: FE zod 스키마가 요구하지만 백엔드 응답 DTO에 없는 필드·형태 → **`safeParse` 실패 → `serverGet` 이 `null` 반환 → 화면 깨짐**.

---

## 1. REQUEST — 백엔드에 없는 요청 필드/헤더 (현재 무시됨)

### 1.1 `POST /api/orders` — `clientChannel` 필드
- **FE 전송**: `components/checkout-form.tsx` body 에 `clientChannel: 'WEB'` 포함.
- **BE 실제**: `OrderCreateRequest { orderType, orderProductInfos, pointPrice, addressId }` — `clientChannel` 필드 없음.
- **현재 영향**: 백엔드에 `spring.jackson.deserialization.fail-on-unknown-properties` 설정 없음(기본 false) → 알 수 없는 필드는 조용히 무시. **400 아님, 무해.**
- **근거**: `backend-contract.md §6` 은 `clientChannel: WEB | APP` 을 요구하지만 백엔드 미구현.
- **해결**: (A) 백엔드 `OrderCreateRequest` 에 `clientChannel` 추가 + 채널별 콜백 분기, 또는 (B) 웹 단일 채널이면 FE에서 필드 제거.

### 1.2 `POST /api/orders` — `Idempotency-Key` 헤더
- **FE 전송**: `crypto.randomUUID()` 를 `Idempotency-Key` 헤더로 전송, Next 프록시가 그대로 포워딩.
- **BE 실제**: 주문 서비스에 idempotency 처리 코드 없음(`grep idempot` → 0건).
- **현재 영향**: 헤더 도달하나 미사용 → 중복 제출 방어 없음. 대기열 통과 후 중복 주문 가능성.
- **근거**: `backend-contract.md §4, §6` 이 idempotency 보장을 요구.
- **해결**: 백엔드에서 `Idempotency-Key` 기반 dedup(예: Redis SETNX) 구현.

### 1.3 큐 대기 응답 (`202` / `X-Queue-Rank` / `Retry-After`)
- **FE 준비됨**: `packages/api/src/api-client.ts` 가 status 202 또는 `X-Queue-Rank` 헤더 시 `QueueRequiredError` throw. 프록시가 `retry-after`, `x-queue-rank` 응답 헤더 포워딩.
- **BE 실제**: 컨트롤러 계층엔 없음. 큐는 게이트웨이 `GlobalQueueFilter` 에 존재 → 게이트웨이가 실제 202 형태를 내는지 런타임 확인 필요.
- **해결**: 게이트웨이 큐 필터 응답이 `backend-contract.md §4` 형태(202 + 헤더 + envelope)와 일치하는지 검증.

---

## 2. RESPONSE — FE 가 요구하나 백엔드에 없는 응답 필드/형태 (화면 깨짐)

> 모두 `lib/server-fetch.ts` 의 `apiResponseSchema(schema).safeParse` 실패 → `null` → 빈/깨진 렌더로 이어짐.

### 2.1 `GET /api/products/detail/{id}` — 응답이 래퍼 객체 (BLOCKER)
- **FE 기대**: 평탄한 `Product` (`productSchema`, top-level `productId,...`). `getProduct` 가 그대로 파싱.
- **BE 실제**: `ProductDetailResponse { product: ProductResponse, reviews: Page<ReviewSummaryDto> }` — **래퍼**. `data.data` 가 `{product, reviews}` 라 `productSchema` 가 top-level `productId` 를 못 찾음.
- **영향**: 상품 상세 페이지 항상 `null` → 깨짐.
- **참고**: 내부 `ProductResponse` 자체는 `productSchema` 전 필드 보유. 래퍼만 벗기면 됨.

### 2.2 `GET /api/products/search` — 목록 응답 DTO 필드 부족 (BLOCKER)
- **FE 기대**: `productPageSchema.content = productSchema` (전체 Product).
- **BE 실제**: `Page<ProductSearchDto>`. `ProductSearchDto` 에 FE 필수 필드 **`stock`, `originImgUrl`, `detailImgUrl`, `limitCountPerUser` 없음**.
- **영향**: 목록(shop/홈) 그리드 항상 빈 배열.
- **해결**: FE 목록 전용 경량 스키마 사용(`searchItemSchema` 류), 또는 BE DTO에 4개 필드 추가.

### 2.3 `GET /api/products/search` — `categoryId` 필수 (BLOCKER, 파라미터)
- **FE 전송**: `getProducts` 는 `categoryId` 가 `undefined` 면 미전송(홈/기본 shop).
- **BE 실제**: `@RequestParam("categoryId") Long` — `required=true`. 누락 시 400.
- **영향**: 카테고리 없는 기본 목록 호출 400 → 빈 화면. (2.2와 합쳐 목록 이중 차단)
- **해결**: BE `required=false`, 또는 FE가 항상 카테고리 지정.

### 2.4 `GET /api/carts` — 응답 형태 가정 불일치 (HIGH)
- **FE 기대**: `data.items` 가 `[{ product: Product, quantity }]` (중첩 product). `cart-provider.tsx` 의 hydrate 가드가 `'items' in data.data` 요구.
- **BE 실제**: `data` 가 **평탄 배열** `List<CartProductResponse>` (`productId, quantity, name, originalPrice, discountedPrice, discountPercent` — 중첩 product 없음, items 래퍼 없음).
- **영향**: 가드 항상 false → 새로고침 시 장바구니 서버 동기화 안 됨(로컬만). 카운트 desync.
- **해결**: FE가 `data` 를 평탄 배열로 읽고 평탄 필드 매핑, 또는 BE가 `{items:[{product,...}]}` 로 래핑.

### 2.5 `GET /api/users/me` — `email`, `nickname` 누락 (HIGH)
- **FE 기대**: `userSchema` 필수 `email(email)`, `nickname`.
- **BE 실제**: `UserResponse.Info { userId, username, role, point }` — `email`, `nickname` **없음**. (가입 시 수집되나 미노출)
- **영향**: 내 정보/계정 페이지 사용자 조회 `null`.
- **해결**: BE `UserResponse.Info` 에 `email`, `nickname` 추가, 또는 FE에서 두 필드 optional 처리.
- **부가**: FE optional 필드 `points`(복수) vs BE `point`(단수) — 이름 불일치로 항상 미매핑(현재 optional이라 무해).

### 2.6 `GET /api/orders/me` — `totalPrice` 없음 + `createdAt`↔`orderDate` (HIGH)
- **FE 기대**: `orderSchema` 필수 `totalPrice(number)`, `createdAt(string)`.
- **BE 실제**: `MyOrderGetResponse { orderId, userId, orderNo, orderType, orderState, myOrderProducts[], totalQuantity, invoiceNumber, orderDate }` — **`totalPrice` 없음**, 날짜는 **`orderDate`** (createdAt 아님).
- **영향**: 주문 목록 페이지 항상 빈 목록.
- **해결**: FE `orderSchema` 를 목록 DTO에 맞춤(`orderDate` 사용, `totalPrice` 제거/optional — 목록 DTO엔 합계 없음), 또는 BE 목록에 `totalPrice` 추가 + `createdAt` 별칭.

---

## 3. 계약 문서엔 있으나 백엔드 미구현 (FE 웹 미호출, 참고)

| 항목 | 백엔드 | 비고 |
|---|---|---|
| `POST /api/products/batch` | 미구현 | 내부 `GET /internal/products?productIds=` 만 존재(게이트웨이 차단). 고아 DTO `ProductReadRequest` 존재 |
| `POST /api/auth/mobile/sign-in\|refresh\|sign-out` | 미구현 | 모바일 토큰-바디 인증 없음(쿠키 방식만) |
| `PUT\|DELETE /api/users/me/devices/{deviceId}` | 미구현 | 디바이스/푸시 토큰 엔드포인트 전무. notification 서비스는 Kafka 이벤트 전용(HTTP 컨트롤러 없음) |

---

## 4. 정상 연결 (참고 — 문제 없음)

auth(sign-in/out/refresh/sign-up), categories/search, `/api/search`, cart 변경(add/update/remove/clear),
address(me·생성·수정·삭제), order(생성·**상세**·취소), reviews(생성·목록), preorders(목록·상세·주문),
coupons/me, points/me, tier/me, events(목록·상세), deliveries(me·상세·tracking) — 모두 메서드·경로·DTO 정합 확인.

> 주의: `order 상세(GET /api/orders/{id})` 는 `orderDetailSchema` 가 `orderDate` 를 optional 로 보유해 정상.
> 깨지는 건 **목록(2.6)** 뿐. 두 스키마(`orderSchema` vs `orderDetailSchema`)의 날짜 필드 규칙 차이가 원인.
