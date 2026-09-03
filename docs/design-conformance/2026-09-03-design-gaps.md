# 시안 대비 남은 격차 — 2026-09-03

`.design/designs/`(OMI 01~05)의 모든 화면·상태를 `apps/web` 구현과 1:1 대조해 맞춘 뒤,
**디자인만으로는 닫을 수 없는** 항목만 남긴 목록이다. 각 항목은 백엔드 계약 또는 외부 연동이 전제다.

## 1. 계약에 필드가 없어 화면을 채우지 못한 곳

| 화면 | 시안이 요구하는 값 | 현재 계약 | 처리 |
|---|---|---|---|
| 마이페이지 · 혜택 등급 진척 | `totalSpent`, `nextTierAmount` | `userTierSchema = { userId, username, tier }` | 누적 구매액 게이지 대신 **등급 단계 게이지**로 대체. 문구도 금액 대신 "다음 등급 X" |
| 혜택 · 포인트 내역 | 적립·사용 **일자** | `pointSchema` 에 날짜 없음 | `point-row-body` 의 날짜 줄 미출력 |
| 혜택 · 쿠폰 탭 | 사용 가능 / **사용 완료** / 기간 만료 3탭 | `couponSchema` 에 `used` 없음 | **사용 가능 / 기간 만료 2탭**만 제공 |
| 주문 상세 | 결제 수단, 도착 예정일, 배송 요청사항, 택배사 | `orderDetailSchema` 에 없음 | 해당 행 미출력. 운송장 번호만 `invoice-card` 에 표시 |
| 결제 결과 | 결제 수단, 배송 예정 기간 | 없음 | 주문번호·결제금액·수량·상태로 대체 |
| 배송 추적 | "택배사에서 보기" 외부 링크 | 택배사 추적 URL 없음 | 버튼 미출력 |
| 배송 목록 | 도착 예정 / 출고 예정 / 수령 시각 | `deliverySummarySchema` 에 없음 | 해당 줄 미출력 |
| 사전예약 | 총 수량(잔여 84 **/ 300**), 예약률 게이지 | `availableQuantity` 만 존재 | 게이지 없이 "잔여 N개"만 표시 |
| 주문 상세 · 상품 행 | 브랜드, 색상 / 사이즈 | `orderProductSchema` 에 없음 | 수량만 표시 |
| PDP 갤러리 | 이미지 4컷 | `originImgUrl`, `detailImgUrl` 2개 | 2컷 렌더 |
| 로그인 | **이메일** 로그인 | `signInSchema` 는 `username` | 라벨을 **아이디**로 유지 (이메일로 바꾸면 인증이 깨짐) |
| 회원가입 | 이름 / 이메일 / 비밀번호 / **연락처** | `signUpSchema` = username·email·nickname·password | 연락처 필드 없음, 아이디·닉네임 추가 |

## 2. 엔드포인트가 없어 동작하지 않는 버튼 (시안 그대로 노출하되 토스트로 안내)

- 재입고 알림 신청 — PDP 품절, 대기열 판매 종료
- 오픈 알림 신청 / 드롭 알림 신청 — 사전예약
- 주소 검색 (우편번호) — 배송지 폼
- 회원 탈퇴 — 마이페이지

## 3. 브라우저에만 저장하는 값

- **최근 본 상품** (`components/recently-viewed-store.ts`) — 홈 "이어서 보기" 레일의 `최근 본` 배지.
  조회 이력 엔드포인트가 없어 `localStorage` 에 보관한다. `장바구니에 있음`·`재입고 알림` 배지는 실제 상태에서 계산한다.

## 4. 스타일시트 보충

`.app-note` 와 `.app-spinner` 는 시안 문서용 `doc.css` 에만 정의돼 있었으나 제품 화면 마크업(OMI 02·03·05)에서 실제로 쓰인다.
`apps/web/app/globals.css` 끝에 **doc.css 원본 값 그대로** 추가했다. 그 외 클래스는 `omi.css` == `globals.css` 로 이미 일치한다.

## 5. 남아 있는 사전 존재 이슈 (이번 작업 범위 밖)

- `npm run lint` 실패 2건 — 둘 다 이번 변경 이전부터 존재
  - `components/checkout-form.tsx` `window.location.href = checkoutUrl` (`react-hooks/immutability`)
  - `components/queue-client.tsx` 폴링 함수의 자기 참조 (`react-hooks/immutability`)
- 로컬 백엔드에서 `GET /api/products/detail/{id}` 가 502 — PDP 는 시안의 404 화면으로 수렴한다(정상 동작).
