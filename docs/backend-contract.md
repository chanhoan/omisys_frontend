# OMI Frontend Backend Contract

OMI 웹·앱의 1차 출시를 위해 OMISYS Gateway가 제공해야 하는 계약입니다. 기존 API는 유지하고 아래 항목을 추가하거나 명확히 합니다.

## 1. 공통 응답

성공과 실패는 기존 envelope를 유지합니다.

```json
{ "statusName": "OK", "message": null, "data": {} }
```

- 오류 HTTP status를 실제 의미에 맞게 사용합니다. 인증 만료는 `401`, 권한 부족은 `403`, 검증 실패는 `400`입니다.
- 공개 조회 대상: 상품 단건·상세, 상품 검색, 카테고리, 이벤트, 사전예약 조회, 리뷰 조회.
- `/internal/*`는 Gateway에서 외부 요청을 계속 차단합니다.

## 2. 웹 인증

```text
POST /api/users/sign-up
POST /api/auth/sign-in
POST /api/auth/refresh
POST /api/auth/sign-out
GET  /api/users/me
```

- access/refresh token은 `HttpOnly; Secure; SameSite=Strict` cookie로 발급합니다.
- 운영 환경에서 웹과 API가 다른 site가 되지 않도록 Next 동일 출처 프록시를 사용합니다.
- 상태 변경 요청은 `Origin` 검증 또는 CSRF token 검증을 추가합니다.

## 3. 앱 인증 추가

```text
POST /api/auth/mobile/sign-in
POST /api/auth/mobile/refresh
POST /api/auth/mobile/sign-out
```

```json
// sign-in request
{ "username": "user", "password": "password" }

// sign-in / refresh response data
{ "accessToken": "...", "refreshToken": "..." }

// refresh / sign-out request
{ "refreshToken": "..." }
```

- access token은 짧은 TTL, refresh token은 rotation과 reuse detection을 적용합니다.
- 앱은 access token을 메모리에만 두고 refresh token만 OS SecureStore에 저장합니다.
- Gateway는 `Authorization: Bearer <accessToken>`을 허용합니다.

## 4. 대기열 계약 수정

현재 빈 body `200`은 정상 성공과 구분되지 않습니다. 대기 중이면 다음 응답을 사용합니다.

```http
HTTP/1.1 202 Accepted
X-Queue-Rank: 154
Retry-After: 3
Content-Type: application/json
```

```json
{
  "statusName": "QUEUE_WAITING",
  "message": "서비스 접속 대기 중입니다.",
  "data": { "rank": 154, "retryAfterSeconds": 3 }
}
```

- mutation은 대기열 통과 후 한 번만 실행되도록 idempotency를 보장합니다.

## 5. 상품·위시리스트

```text
POST /api/products/batch
Body: { "productIds": ["uuid", "uuid"] }
Response data: ProductResponse[]

GET    /api/wishlists/me
POST   /api/wishlists/products/{productId}
DELETE /api/wishlists/products/{productId}
```

- 위시리스트는 사용자 ID와 상품 ID만 소유합니다.
- 카드 정보는 상품 batch API로 조회해 가격·품절 상태를 갱신합니다.
- 1차 상품 모델은 단일 `mainColor`, `size`, `stock`을 유지합니다. SKU variant는 후속 범위입니다.

## 6. 주문·결제

```http
POST /api/orders
Idempotency-Key: <uuid>
```

```json
{
  "orderType": "NORMAL",
  "orderProductInfos": [
    { "productId": "uuid", "quantity": 1, "userCouponId": null }
  ],
  "pointPrice": 0,
  "addressId": 1,
  "clientChannel": "WEB"
}
```

응답 data:

```json
{ "orderId": 42, "checkoutUrl": "https://..." }
```

- `clientChannel`은 `WEB | APP` enum입니다.
- 웹 callback은 OMI 웹 `/checkout/result`로 이동합니다.
- 앱 성공: `omi://payments/result?status=success&orderId=42`
- 앱 실패: `omi://payments/result?status=fail&orderId=42`
- redirect URL은 서버 allowlist로 결정합니다.
- 앱 복귀 후 `GET /api/orders/{orderId}`를 재조회해 서버 상태를 최종 기준으로 사용합니다.

## 7. 푸시 토큰

```text
PUT    /api/users/me/devices/{deviceId}
DELETE /api/users/me/devices/{deviceId}
```

```json
{ "platform": "IOS", "pushToken": "token", "appVersion": "0.1.0" }
```

- 플랫폼 enum: `IOS | ANDROID`.
- 사용자 한 명이 여러 기기를 가질 수 있어야 합니다.
- 로그아웃 시 해당 device token을 삭제합니다.
- 거래 알림 payload에는 `orderId`와 정해진 `type`만 포함합니다.

## 8. 완료 검증

- 웹 cookie 로그인, 갱신, 로그아웃 통합 테스트.
- 앱 token rotation, 탈취 refresh token 재사용 차단 테스트.
- 대기 응답과 원 mutation 단일 실행 테스트.
- Toss sandbox 성공·실패, 웹 callback, 앱 deep link 테스트.
- 위시리스트 사용자 격리와 push device 소유권 테스트.
