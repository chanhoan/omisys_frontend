# Frontend ↔ Backend 계약 정합 — 진행 기록 (resume용)

프론트엔드가 백엔드와 주고받는 계약의 어긋남을 추적하는 문서. clear 후 이 문서만으로 이어서
진행할 수 있도록 조사 사실을 모두 기록한다.

- **기준일**: 2026-09-01
- **기준 스펙**: `../omisys` 커밋 `1878a12` (2026-08-28). `origin/main` 과 `origin/fix/tunnel-reads-env` 동일.
- **벤더된 사본**: `contracts/openapi/*.json` (9개). `npm run contracts:check` 로 신선도를 지킨다.

---

## 고객용 API 커버리지

```
스펙 전체 오퍼레이션                              115
├─ /internal/**, /payments/** (게이트웨이 차단)     26   범위 밖 — 브라우저가 부를 수 없음
└─ 공개(브라우저 도달 가능)                         89
   ├─ ROLE_ADMIN / ROLE_MANAGER 필요               51   범위 밖 — 관리자 콘솔 미존재(별도 PRD)
   └─ 고객용(일반 사용자)                          38   ← 38/38 정리 완료
      ├─ 연결 + 계약 정합                          32   D1~D5
      └─ 미연결 판정                                6   M1~M5
```

관리자용 51개는 붙일 화면이 없다 — `apps/web/app` 라우트 12개가 전부 고객용이고 `admin`/`ROLE_MANAGER`
코드 참조가 0건이다. `/admin` 라우트 트리 · 권한 가드 · 목록/폼 컴포넌트 세트가 필요한 별도 프로젝트다.

---

## 1차: B1~B6 (2026-06-10, 완료)

`docs/frontend-add-api.md` 분석에서 도출한 6개 깨짐.

| # | 항목 | 상태 | 위치 |
|---|---|---|---|
| B1 | 상품상세 `{product,reviews}` 래퍼 | ✅ 완료 | FE: `contracts.ts`(productDetailSchema), `server-fetch.ts`(getProduct) |
| B5 | `GET /api/users/me` email/nickname | ✅ 완료 | FE: `contracts.ts`(userSchema), `account/page.tsx`, `site-header.tsx` |
| B6 | `GET /api/orders/me` totalPrice/orderDate | ✅ 완료 | FE: `contracts.ts`(orderSchema), `account/orders/page.tsx` |
| B2 | `categoryId` 필수 | ✅ BE 반영 확인 | 스펙상 `required=false` — 커밋됨 |
| B3 | 목록 전용 경량 스키마 | ✅ 완료 (A안: FE-only, stock optional) | FE: `contracts.ts`(productListItemSchema), `catalog.ts`, `product-card/grid/showcase` |
| B4 | cart hydration | ✅ 완료 (B안: FE lean cart + BE 썸네일) | BE `CartProductResponse.thumbnailImgUrl` 커밋 확인 · FE `cart.ts`(CartItemView) |

> B2·B4 의 백엔드 변경은 2026-08-28 스펙에 반영되어 있음을 확인했다(미커밋 상태가 아님).

---

## 2차: D1~D5 (2026-09-01, 완료)

8/28 스펙 커밋을 기준으로 재대조해 나온 드리프트.

| # | 심각도 | 대상 | 문제 | 상태 |
|---|---|---|---|---|
| **D1** | **P0** | `GET /api/products/detail/{productId}` | `productSchema` 가 `isPublic`/`isDeleted` 를 필수로 요구하나 와이어 키는 `public`/`deleted` → `safeParse` 실패 → `getProduct` null → **PDP 전면 파손** | ✅ 수정 |
| **D2** | P1 | `POST /api/users/sign-up` | 폼이 백엔드 `@Pattern` 보다 느슨해 폼 통과 후 서버 400 | ✅ 수정 |
| **D3** | P3 | `POST /api/orders`, 가입 body | 백엔드 DTO 에 없는 `clientChannel` / `role` 전송 | ✅ 제거 |
| **D4** | P0(코드젠) | 스펙 파일 자체 | springdoc 이름 충돌로 30개 오퍼레이션이 다른 리소스 DTO 로 기술됨 | ⏳ 백엔드 후속 |
| **D5** | P2 | fixture | zod 와 같은 거짓 가정을 공유해 회귀를 감지하지 못함 | ✅ 수정 + 자동 검출 도입 |

### D1 — 확정된 근거 (재조사 불필요)

`ProductResponse.java:34,36` 은 `private boolean isPublic` / `private boolean isDeleted` 다. Lombok `@Getter`
가 `isPublic()` 을 만들고 Jackson 이 `is` 접두를 떼므로 **와이어 키는 `public` / `deleted`** 다.
`soldout` 은 뗄 접두가 없어 그대로다. `contracts/openapi/product.json` 의 `ProductResponse.properties` 도 동일.

```jsonc
// 실제 응답 (변경 후 스키마가 기대하는 것)
{ "public": true, "soldout": false, "deleted": false }
```

`PreOrderResponse` 도 같은 규칙이라 `preorderSchema` 를 `public`/`deleted` 로 맞췄다.

> 2026-06-10 문서가 "런타임 미검증 가정"으로 남겨 두었던 항목이다. 8/28 스펙이 답을 줬고, 수정했다.

### D2 — 확정된 근거

`UserRequest.java:17,22` — `@Pattern("^[a-z0-9]{4,10}$")`(username), `@Pattern("^[a-zA-Z0-9_#$%^!-]{8,15}$")`(password).
`signUpSchema` 를 같은 정규식으로 맞추고, 실패 시 zod 메시지를 그대로 노출한다.

**로그인은 다르다.** `AuthRequest.java:15-19` 의 `SignIn` 은 `@NotBlank` 뿐이고 `@Pattern` 이 없다.
가입 규칙을 로그인에 걸면 백엔드에 없는 제약을 프론트가 만들어내는 셈이고, 시드 관리자(`admin`)처럼
ops 가 BCrypt 해시를 직접 넣은 계정이 웹으로 로그인할 수 없게 된다. `signInSchema` 는 `trim().min(1)` 로 둔다.

---

## 3차: M1~M5 — 미연결 6개 판정 (2026-09-01)

고객용 38개 중 웹이 호출하지 않던 6개. 스펙에 있다고 다 붙이지 않고 각각 판정했다.

| # | 오퍼레이션 | 판정 | 근거 |
|---|---|---|---|
| **M1a** | `PATCH /api/reviews/{reviewId}` | ✅ 구현 | 작성만 있고 수정이 없던 기능 구멍 |
| **M1b** | `DELETE /api/reviews/{reviewId}` | ✅ 구현 | 동일 |
| **M2** | `POST /api/auth/refresh` | ✅ 이미 연결됨 | `api-client.ts` 의 `refresh()` 가 401 수신 시 호출. 서버 컴포넌트 경로는 만료 시 `null` → 로그인 유도가 의도된 동작 |
| **M3** | `DELETE /api/orders/{orderId}` | ❌ 미사용 | 취소(`PATCH .../cancel`)로 충분. 주문을 지우면 취소 이력이 사라져 배송·정산 추적이 끊긴다. 관리자 기능 |
| **M4** | `PATCH /api/orders/{orderId}/` | ⏳ 백엔드 이관 | 경로가 슬래시로 끝나며 `PATCH /api/orders/{orderId}/{orderState}` 와 매핑이 겹치는 오류로 보임. `summary` 가 없어 용도 판별 불가 |
| **M5** | `GET /api/products/search/{productId}` | ❌ 미사용 | detail 이 재고·상세이미지·리뷰까지 담은 상위집합. 같은 목적의 경로를 둘로 늘릴 이유 없음 |

### M1 구현 메모

- 요청 계약: `ReviewRequest.Update` = `@NotNull @Min(1) @Max(5)` rating + `@NotBlank @Size(max=1000)` content.
  스펙이 `minLength: 0` 으로 보이는 것은 springdoc 이 `@NotBlank` 를 표현하지 못하기 때문이다.
  `reviewUpdateSchema` 가 `{ rating: 1~5, content: 1~1000 }` 로 미러링한다.
- 응답은 둘 다 `ApiResponseVoid` — `data` 를 읽지 말 것.
- **소유권 검증은 백엔드가 한다**: `ReviewService.updateReview`/`deleteReview` 가 `review.validateOwner(userId)` 를 호출한다.
  `ReviewActions` 의 조건부 노출(`review.userId === viewerId`)은 UX 이지 보안 경계가 아니다.
- 백엔드가 `existsByProductIdAndUserId` 로 **상품당 1인 1리뷰**를 강제하므로 목록에 본인 리뷰는 최대 1건이다.
- 주의: `getReviews` 는 `{ revalidate: 30 }` 캐시라 수정/삭제 직후 최대 30초간 옛 목록이 보일 수 있다.
  즉시 반영이 필요하면 그 호출만 `cache: 'no-store'` 로 바꾸고 사유를 주석에 남길 것.

---

## 계약 드리프트 자동 검출 (신규)

손으로 쓴 fixture 는 zod 와 같은 가정을 공유하므로, 그 가정이 틀려도 테스트가 통과한다(D5).
이제 스펙을 테스트에 물린다.

| 파일 | 역할 |
|---|---|
| `contracts/openapi/*.json` | 백엔드 스펙의 벤더된 사본 (커밋 대상) |
| `scripts/sync-openapi.mjs` | 동기화 + `--check` 신선도 확인 |
| `packages/api/src/openapi-spec.ts` | 스펙 로딩 · `$ref` 해석 · 봉투/페이지 벗기기 (**Node 전용 — `index.ts` 에서 export 금지**) |
| `packages/api/src/contract-drift.ts` | zod ↔ 스펙 키/타입 대조 + `KNOWN_SPEC_DEFECTS` |
| `packages/api/src/contract-drift.test.ts` | 17개 엔드포인트 대조 |

**왜 코드젠이 아닌가**: D4 때문에 `openapi-typescript` 가 만드는 타입이 틀린다. 그리고 이 저장소는 이미
zod 로 런타임 검증을 하고 있어(`serverGet` 의 `safeParse`), 컴파일타임 전용 타입은 그 방어를 대체하지 못한다.
zod 를 진실원천으로 두고 스펙을 감시자로 쓴다.

**왜 샘플 생성이 아닌가**: `.url()`/`.uuid()`/`.email()` refinement 때문에 스펙 타입만 보고 만든 샘플은
대량으로 거짓 실패한다. 실제 사고(B1/B5/B6/D1)는 전부 **키 이름** 문제였다.

### 계약 갱신 절차

```bash
# 1. 백엔드에서 DTO 를 고쳤다면 스펙을 다시 뽑는다 (../omisys)
python3 scripts/api/dump_openapi.py product        # 서비스를 한꺼번에 띄우지 말 것

# 2. 프론트로 동기화
npm run contracts:sync

# 3. 드리프트 확인
npm test
```

> `../omisys/docs/api/README.md`: `--parallel` 로 여러 서비스를 동시에 올리면 Config Server 응답을 받지
> 못해 설정이 통째로 빈 채 기동 실패하며, 에러 메시지("Failed to determine a suitable driver class")가
> 원인을 전혀 드러내지 않는다. 하나씩, 혹은 두 개씩 띄운다.

---

## 백엔드 후속 (D4 · M4)

### D4 — springdoc 스키마 이름 충돌

springdoc 이 내부 클래스를 simple name 으로 등록해 서로 다른 DTO 가 같은 컴포넌트 이름을 덮어쓴다.
`../omisys` 전역 `grep springdoc` 결과 설정 파일이 **0건** — `springdoc.use-fqn` 미설정이 근인.

| 스펙 | 충돌 컴포넌트 | 공유 리소스 | 잘못 기술된 오퍼레이션 |
|---|---|---|---|
| `user.json` | `Get` | address / point / tier | 9 |
| `user.json` | `Create` | address / tier / users | 3 |
| `user.json` | `Update` | address / tier | 2 |
| `promotion.json` | `Get` | coupons / events | 6 |
| `promotion.json` | `Create` / `Update` | coupons / events | 4 |
| `product.json` | `Create` / `Update` | categories / preorders / products | 6 |

현재 `user.json` 의 `Get` 은 tier 형태(`{tier,userId,username}`), `promotion.json` 의 `Get` 은 event 형태
(`{content,endAt,id,imgUrl,startAt,title}`) 로 기록되어 있다. **address / point / coupon 은 스펙상 표현 자체가 없다.**

런타임 정합은 백엔드 소스로 확인해 두었다:
- `AddressResponse.Get {id,userId,alias,recipient,phoneNumber,zipcode,address,isDefault}` — `addressSchema` 와 일치
- `CouponResponse.Get {couponId,name,type,discountType,discountValue,minBuyPrice,maxDiscountPrice,quantity,startDate,endDate,userTier,eventId}` — `couponSchema` 와 일치

**권장 수정** — 충돌 내부 클래스에 `@Schema(name = "...")` 부여. 설정이 private config 저장소에 있어
`springdoc.use-fqn` 프로퍼티 추가가 어렵고, FQN 이름은 코드젠 결과가 지저분하다.

대상 파일:
- `service/user/server/.../application/dto/{AddressResponse,PointResponse,TierResponse,UserResponse,UserTierResponse}.java`
- `service/user/server/.../presentation/request/{AddressRequest,TierRequest,UserRequest}.java`
- `service/promotion/server/.../presentation/response/{CouponResponse,EventResponse}.java`
- `service/promotion/server/.../presentation/request/{CouponRequest,EventRequest}.java`
- `service/product/server/.../presentation/request/{CategoryRequest,PreOrderRequest,ProductRequest}.java`

예: `AddressResponse.Get` → `@Schema(name = "AddressGet")`, `CouponResponse.Get` → `@Schema(name = "CouponGet")`,
`UserRequest.Create` → `@Schema(name = "UserCreate")`.

수정 후: 서비스 기동 → `dump_openapi.py user promotion product` → FE `npm run contracts:sync` →
`packages/api/src/contract-drift.ts` 의 `KNOWN_SPEC_DEFECTS` 에서 해당 항목 제거 →
드리프트 테스트에 address / coupon / point 케이스 추가.

### M4 — `PATCH /api/orders/{orderId}/` 경로 매핑

경로가 슬래시로 끝난다. `PATCH /api/orders/{orderId}/{orderState}` 와 겹치는 매핑 오류로 보이며,
`summary` 가 없어 용도를 판별할 수 없다. 백엔드에서 의도를 확인하고 정리하거나 제거할 것.

### 그 밖의 백엔드 백로그

- `Idempotency-Key` 미구현 — `POST /api/orders` 중복 제출 방어 없음 (`docs/frontend-add-api.md §1.2`).
  FE 는 헤더를 보내고 프록시가 포워딩하지만 주문 서비스에 처리 코드가 없다.
- 게이트웨이 큐 202 응답 형태가 `api-client.ts` 의 `QueueRequiredError` 기대와 맞는지 런타임 미검증.
- 스펙에 에러 응답(`statusName` 목록)이 문서화되어 있지 않다 — 성공 스키마만 있다.
- 오퍼레이션 `summary` 가 대부분 비어 있다.

---

## 다른 범위

- **모바일 전용**: `POST /api/auth/mobile/*` 는 여전히 백엔드 미구현. 반면
  `PUT|DELETE /api/users/me/devices/{deviceId}` 는 **이제 백엔드에 존재한다**(`user.json` 확인).
  웹이 호출하지 않으므로 `apps/mobile` 작업으로 이관.
- **관리자 콘솔**: 위 커버리지 표의 51개. 별도 PRD 필요.

## 검증

```bash
npm run typecheck        # 5개 워크스페이스
npm run lint
npm run contracts:check  # 벤더 사본 신선도
npm test                 # 커버리지 임계 80% 포함
npm run build --workspace @omi/web
```

> Node 는 ≥20.12 가 필요하다(vitest). 또한 `node_modules` 가 다른 플랫폼에서 설치된 상태면
> tsc·vitest 가 실행되지 않는다 — `npm ci` 로 재설치할 것.
