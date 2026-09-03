# Plan: 주소 검색 (Daum/Kakao 우편번호 위젯) — Frontend

## Summary
`address-form.tsx` 의 "주소 검색" 버튼은 지금 `show('주소 검색은 준비 중입니다.')` 토스트만 띄운다.
이 버튼을 Daum(Kakao) 우편번호 위젯에 연결해 우편번호·도로명 주소를 자동으로 채운다.
위젯은 키·쿼터가 없는 100% 클라이언트 스크립트라 백엔드 호출 없이 프론트에서 완결된다.
백엔드가 구조화 필드(`roadAddress`/`jibunAddress`/`detailAddress` 등)를 받도록 확장되면
그 필드도 함께 전송한다(백엔드 계획서 참고). 확장 전에도 기존 단일 `address` 문자열
방식으로 동작한다.

## User Story
As a 쇼핑몰 사용자,
I want 배송지 입력 폼에서 "주소 검색"을 눌러 우편번호 팝업으로 주소를 고르고,
So that 도로명 주소와 우편번호를 오타 없이 한 번에 채울 수 있다.

## Problem → Solution
현재: "주소 검색" 버튼 = placeholder 토스트. 사용자가 우편번호·도로명 주소를 직접 손으로 입력 → 오타·형식 불일치.
목표: 버튼 클릭 → Daum 우편번호 위젯(모달) → 선택 시 `zipcode`·`addressBase` 자동 채움, `addressDetail` 로 포커스 이동.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A (대화 기반)
- **PRD Phase**: N/A
- **Estimated Files**: 5 (신규 3, 수정 2, 스타일 1 선택)
- **Repo**: `E:\refactoring\omisys_frontend` (`@omi/web`)
- **관련 계획서**: `E:\refactoring\omisys\docs\plans\address-search-backend.plan.md`

---

## UX Design

### Before
```
배송지 추가/수정 폼
┌───────────────────────────────────────┐
│ 받는 분   [___________]                │
│ 연락처    [___________]                │
│ 우편번호  [_____]  [ 주소 검색 ]  ← 클릭 시 "준비 중" 토스트
│ 기본 주소 [__________________] ← 직접 타이핑
│ 상세 주소 [__________________]         │
│ □ 기본 배송지로 설정                    │
│           [ 저장 ]  [ 취소 ]           │
└───────────────────────────────────────┘
```

### After
```
[ 주소 검색 ] 클릭
        │
        ▼
┌─ 모달 (.dialog-scrim / .dialog) ─────────┐
│  주소 검색                    [ 닫기 ]   │
│  ┌───────────────────────────────────┐  │
│  │  (Daum 우편번호 위젯 embed iframe) │  │
│  │  검색어 입력 → 주소 목록 → 선택     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
        │  oncomplete(data)
        ▼
우편번호 [01234](readonly)  기본 주소 [서울 성동구 …](readonly)
상세 주소 [__________] ← 자동 포커스, 커서 여기
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| "주소 검색" 버튼 | 토스트 "준비 중" | 모달로 Daum 위젯 open | `type="button"` 유지 |
| 우편번호 input | 자유 입력 | `readOnly`, 위젯으로만 채움 | 수기 입력 차단으로 형식 보장 |
| 기본 주소 input | 자유 입력 (`defaultValue`) | `readOnly`, 위젯으로만 채움, controlled | |
| 상세 주소 input | 자유 입력 | 변화 없음. 위젯 선택 후 자동 포커스 | |
| 모달 | 없음 | `Esc`/배경 클릭/닫기 버튼으로 닫힘 | `confirm-dialog.tsx` 패턴 재사용 |
| 편집 모드 진입 | `splitAddress()` 로 base/detail 분해 | 동일 (하위호환 유지) | |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `apps/web/components/address-form.tsx` | 1-93 | 수정 대상 전체. `DETAIL_SEPARATOR`/`splitAddress`/`handleSubmit`/입력 필드 구조 |
| P0 | `apps/web/next.config.ts` | 1-38 | **CSP 헤더 — Daum 스크립트/iframe/XHR 전부 차단됨. 반드시 수정** |
| P0 | `apps/web/components/confirm-dialog.tsx` | 1-95 | 모달 패턴(스크림, `role="dialog"`, 포커스 트랩, Esc). 주소 검색 모달이 미러링할 원본 |
| P1 | `apps/web/components/toast.tsx` | all | `useToast().show` — 기존 에러/성공 표시 방식 |
| P1 | `apps/web/components/checkout-form.test.tsx` | 1-60 | 컴포넌트 테스트 패턴: `vi.stubGlobal('fetch')`, `render`, `screen`, `waitFor`, `vi.mock('next/navigation')` |
| P1 | `packages/api/src/contracts.ts` | 178-189 | `addressSchema` / `Address` 타입 — 전송 payload 형태 |
| P2 | `apps/web/app/account/addresses/page.tsx` | all | `AddressForm` 사용처(추가 + `AddressCard` 편집). 서버컴포넌트 |
| P2 | `apps/web/components/checkout-form.tsx` | 180-210 | 저장된 주소를 소비만 함. **이번 스코프 아님** 확인용 |
| P2 | `apps/web/app/api/[...path]/route.ts` | all | `POST /api/address` 가 게이트웨이로 프록시되는 경로. 변경 없음 |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Daum 우편번호 서비스 | https://postcode.map.daum.net/guide | 스크립트 1개(`//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js`), 키 없음, 무료, 쿼터 없음. `new daum.Postcode({ oncomplete }).embed(elem)` 또는 `.open()` |
| oncomplete data 필드 | 같은 가이드 "데이터 목록" | `zonecode`(5자리 우편번호), `roadAddress`, `jibunAddress`, `autoRoadAddress`, `autoJibunAddress`, `bname`(법정동), `buildingName`, `apartment`, `sido`, `sigungu`, `userSelectedType`('R' 도로명 / 'J' 지번) |
| 참고항목 조합 | 가이드 예제 | `userSelectedType==='R'` 이면 `roadAddress` 사용, 그 뒤 `(bname / buildingName)` 를 괄호로 덧붙이는 게 관례 |
| embed 재사용 | 가이드 FAQ | `embed()` 대상 컨테이너를 매번 비우고 다시 `embed` 해야 함. 인스턴스 재사용 금지 |

```
KEY_INSIGHT: 위젯 스크립트/iframe/XHR 이 전부 외부 도메인(*.daumcdn.net, *.daum.net)
APPLIES_TO: next.config.ts CSP (Task 1) — 안 고치면 위젯이 조용히 안 뜬다
GOTCHA: 개발 모드 CSP 와 프로덕션 CSP 가 분기(`scriptSrc` 변수). 양쪽 다 도메인 추가 필요

KEY_INSIGHT: 위젯은 SSR 불가. 스크립트는 클라이언트에서만 로드
APPLIES_TO: 'use client' 컴포넌트에서 동적 주입 또는 next/script. 이 repo 는 next/script 사용처 0건 → 수동 주입 훅으로 통일

KEY_INSIGHT: oncomplete 는 위젯 컨텍스트 콜백. React state setter 를 안전하게 호출하려면 최신 setter 참조 필요
APPLIES_TO: useDaumPostcode 훅에서 콜백을 ref 로 감싸거나, 모달 열 때마다 새 인스턴스 생성
```

---

## Patterns to Mirror

### CLIENT_COMPONENT_HEADER
```tsx
// SOURCE: apps/web/components/address-form.tsx:1-10
'use client'

import type { Address } from '@omi/api'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { ConfirmDialog } from './confirm-dialog'
import { FormErrorBox } from './form-error-box'
import { useToast } from './toast'
```

### MODAL_STRUCTURE
```tsx
// SOURCE: apps/web/components/confirm-dialog.tsx:57-78
if (!open) return null
return (
  <div className="dialog-scrim">
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="dialog"
      onKeyDown={handleKeyDown}   // Esc → onCancel
      role="dialog"
    >
      <h2 id={titleId}>{title}</h2>
      {/* body */}
      <div className="dialog-actions">…</div>
    </div>
  </div>
)
```

### FOCUS_RESTORE
```tsx
// SOURCE: apps/web/components/confirm-dialog.tsx:36-44
useEffect(() => {
  if (!open) return undefined
  previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  cancelButtonRef.current?.focus()
  return () => previousFocusRef.current?.focus()
}, [open])
```

### CONTROLLED_INPUT_FROM_ADDRESS
```tsx
// SOURCE: apps/web/components/address-form.tsx:21-33  (현재는 uncontrolled defaultValue)
// 변경: base/detail/zipcode 를 useState 로 승격
const initial = splitAddress(address?.address)
const [base, setBase] = useState(initial.base)
const [detail, setDetail] = useState(initial.detail)
const [zipcode, setZipcode] = useState(address?.zipcode ?? '')
```

### SUBMIT_HANDLER
```tsx
// SOURCE: apps/web/components/address-form.tsx:35-67
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  setError(''); setPending(true)
  const data = {
    recipient, phoneNumber, zipcode,
    address: detail ? `${base}${DETAIL_SEPARATOR}${detail}` : base,
    isDefault: (form.elements.namedItem('isDefault') as HTMLInputElement).checked,
  }
  try {
    const res = await fetch(isEdit ? `/api/address/${address.id}` : '/api/address', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const payload = await res.json() as { message?: string }
    if (!res.ok) throw new Error(payload.message ?? '배송지를 저장하지 못했습니다.')
    show(isEdit ? '배송지를 수정했습니다.' : '배송지를 추가했습니다.')
    if (!isEdit) form.reset()
    onSaved?.(); router.refresh()
  } catch (caught) {
    setError(caught instanceof Error ? caught.message : '배송지를 저장하지 못했습니다.')
  } finally { setPending(false) }
}
```

### COMPONENT_TEST
```tsx
// SOURCE: apps/web/components/checkout-form.test.tsx:1-36
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }))

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => response({ statusName: 'OK', message: null, data: null })))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `apps/web/next.config.ts` | UPDATE | CSP 에 `*.daumcdn.net` / `*.daum.net` 를 `script-src` `connect-src` `frame-src` `img-src` 에 허용 |
| `apps/web/components/use-daum-postcode.ts` | CREATE | 스크립트 1회 주입 + `window.daum.Postcode` 준비 Promise 를 주는 훅 |
| `apps/web/components/address-search-dialog.tsx` | CREATE | `.dialog-scrim`/`.dialog` 모달 + 위젯 `embed()` 컨테이너 + `onComplete(data)` 콜백 |
| `apps/web/components/address-form.tsx` | UPDATE | 버튼 → 모달 오픈, 입력 3개 controlled + `readOnly`, `onComplete` 로 채움, 상세주소 포커스, (백엔드 확장 시) 구조화 필드 전송 |
| `apps/web/components/address-form.test.tsx` | CREATE | 위젯 mock → 버튼→모달→oncomplete→필드 채움→submit body 검증 |
| 주소폼 스타일 파일 | UPDATE (필요 시) | 위젯 embed 컨테이너 높이(예: `min-height: 420px`) 지정 |

> 스타일 파일 경로는 구현 시 `grep -rn "address-form\|dialog-scrim" apps/web/**/*.css` 로 확인.
> `.dialog`/`.dialog-scrim` 클래스는 이미 전역에 존재(confirm-dialog 가 사용 중) → 재사용.

## NOT Building

- 백엔드 `/api/address/search` 프록시 엔드포인트 (위젯은 클라이언트 완결형 — 불필요)
- `checkout-form.tsx` 인라인 주소 입력 (체크아웃은 저장된 주소 선택만 함 — 스코프 밖)
- `apps/mobile` 대응 (별도 작업)
- 주소 유효성 서버 재검증/juso.go.kr 대조 (백엔드 계획서에서 Bean Validation 만)
- `alias`(배송지 별칭) 입력 UI — 현재 폼에 없고 이번 작업과 무관 (기존 드리프트)
- 지번/도로명 토글 표시 UI

---

## Step-by-Step Tasks

### Task 1: CSP 에 Daum 도메인 허용
- **ACTION**: `apps/web/next.config.ts` 의 `Content-Security-Policy` 값 수정
- **IMPLEMENT**:
  - `script-src` (dev/prod 분기 `scriptSrc` 변수 양쪽): `https://t1.daumcdn.net` 추가
  - CSP 문자열에 `frame-src 'self' https://*.daum.net https://*.daumcdn.net;` 항목 신설 (현재 없음 → `default-src` 로 폴백되어 iframe 차단됨)
  - `connect-src` 를 `'self' https://*.daum.net https://*.daumcdn.net` 로 확장 (위젯이 주소 데이터 XHR)
  - `img-src` 에 `https://*.daumcdn.net https://*.daum.net https://*.kakaocdn.net` 추가
- **MIRROR**: 기존 `headers()` 배열/문자열 조립 방식 그대로
- **IMPORTS**: 없음
- **GOTCHA**: dev CSP 는 `'unsafe-eval'` 포함, prod 는 미포함 — 두 분기 문자열 모두에 도메인이 들어가야 함. 위젯 자체는 `eval` 불필요
- **VALIDATE**: `npm run dev:web` 후 브라우저 콘솔에 CSP 위반 로그 없이 위젯 iframe 이 뜸. `curl -sI http://localhost:3000/ | grep -i content-security-policy` 로 헤더에 daum 도메인 확인

### Task 2: `use-daum-postcode.ts` 훅
- **ACTION**: `apps/web/components/use-daum-postcode.ts` 생성
- **IMPLEMENT**:
  - 상수 `const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'`
  - `loadDaumPostcode(): Promise<DaumPostcodeCtor>` — 모듈 스코프 캐시된 Promise. `document.querySelector` 로 기존 태그 확인 → 없으면 `<script>` 주입, `onload` 에서 `window.daum.Postcode` resolve, `onerror` 에서 reject
  - 훅 `useDaumPostcode()` → `{ ready: boolean, load: () => Promise<DaumPostcodeCtor>, error: Error | null }`
  - 최소 타입 선언: `interface DaumPostcodeData { zonecode: string; roadAddress: string; jibunAddress: string; autoRoadAddress: string; autoJibunAddress: string; bname: string; buildingName: string; userSelectedType: 'R' | 'J'; sido: string; sigungu: string }` + `interface DaumPostcodeOptions { oncomplete: (data: DaumPostcodeData) => void; onclose?: (state: string) => void; width?: string | number; height?: string | number }` + `type DaumPostcodeCtor = new (o: DaumPostcodeOptions) => { embed: (el: HTMLElement) => void; open: () => void }`
  - `declare global { interface Window { daum?: { Postcode: DaumPostcodeCtor } } }`
- **MIRROR**: 이 repo 는 `next/script` 미사용 → 수동 주입. 훅 네이밍 `use*` (기존 `useToast`, `useCart` 와 일관)
- **IMPORTS**: `import { useCallback, useEffect, useState } from 'react'`
- **GOTCHA**: SSR 에서 `document`/`window` 접근 금지 — `load()` 는 이벤트 핸들러/effect 안에서만 호출. 캐시 Promise 로 중복 주입 방지
- **VALIDATE**: 훅만으로는 UI 없음. Task 5 테스트에서 mock 으로 대체되므로 여기선 타입체크 통과(`npm run typecheck --workspace @omi/web`)만 확인

### Task 3: `address-search-dialog.tsx`
- **ACTION**: `apps/web/components/address-search-dialog.tsx` 생성
- **IMPLEMENT**:
  - props: `{ open: boolean; onClose: () => void; onComplete: (data: DaumPostcodeData) => void }`
  - `confirm-dialog.tsx` 의 스크림/`role="dialog"`/`aria-modal`/Esc 처리/`previousFocusRef` 복원 패턴 미러
  - `open` 이 true 가 되면: `load()` → `new Ctor({ oncomplete: (data) => { onComplete(data); onClose() }, onclose, width: '100%', height: '100%' }).embed(containerRef.current!)`
  - `containerRef` div: `className="address-search-embed"`, effect cleanup 에서 `container.innerHTML = ''`
  - 로드 실패 시 `FormErrorBox` 로 "주소 검색 서비스를 불러오지 못했습니다." + 닫기 버튼
  - 헤더에 제목 `주소 검색` + 닫기 버튼(`.button.ghost`)
- **MIRROR**: `MODAL_STRUCTURE`, `FOCUS_RESTORE` (Patterns to Mirror)
- **IMPORTS**: `import { useEffect, useId, useRef, useState } from 'react'` / `import { FormErrorBox } from './form-error-box'` / `import { useDaumPostcode, type DaumPostcodeData } from './use-daum-postcode'`
- **GOTCHA**: `embed()` 컨테이너는 매 open 마다 비우고 재-embed. 인스턴스/컨테이너 재사용하면 빈 화면. `open===false` 일 때 `return null` (confirm-dialog 와 동일)
- **VALIDATE**: Task 5 테스트에서 `open` 토글 시 `daum.Postcode` mock 이 호출되고 `embed` 가 컨테이너와 함께 불림

### Task 4: `address-form.tsx` 연결
- **ACTION**: `apps/web/components/address-form.tsx` 수정
- **IMPLEMENT**:
  1. `zipcode`/`base`/`detail` 을 `useState` 로 승격 (Patterns: `CONTROLLED_INPUT_FROM_ADDRESS`). `AddressCard` 편집 진입 시 `splitAddress(address.address)` 초기값 유지
  2. `const [searchOpen, setSearchOpen] = useState(false)`
  3. "주소 검색" 버튼 `onClick={() => setSearchOpen(true)}` (기존 `show('… 준비 중입니다.')` 제거)
  4. 폼 하단에 `<AddressSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onComplete={handlePostcodeComplete} />`
  5. `handlePostcodeComplete(data)`:
     - `const road = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress`
     - 참고항목: `const extra = data.userSelectedType === 'R' ? [data.bname, data.buildingName].filter(Boolean).join(', ') : ''`
     - `setZipcode(data.zonecode)`
     - `setBase(extra ? road + ' (' + extra + ')' : road)`
     - `setDetail('')`
     - `requestAnimationFrame(() => detailInputRef.current?.focus())`
  6. `zipcode` input: `value={zipcode}` + `readOnly` + `name="zipcode"` (submit 은 state 값 사용 권장)
  7. `addressBase` input: `value={base}` + `readOnly` + placeholder `"주소 검색을 눌러 선택하세요"`
  8. `addressDetail` input: `value={detail}` `onChange` + `ref={detailInputRef}`
  9. `handleSubmit` 의 `read()` 호출을 state 값 사용으로 교체 (`recipient`/`phoneNumber` 는 기존 방식 유지 가능)
  10. **백엔드 확장 연동(조건부)**: 백엔드 계획서(구조화 필드) 적용 시 `data` 객체에 추가 —
      `roadAddress: data.userSelectedType === 'R' ? data.roadAddress : ''`,
      `jibunAddress: data.jibunAddress`, `detailAddress: detail`,
      `sido: data.sido`, `sigungu: data.sigungu`.
      기존 `address` 문자열도 계속 전송(하위호환). 백엔드 미적용 상태면 이 필드들 생략
- **MIRROR**: `SUBMIT_HANDLER`, `CONTROLLED_INPUT_FROM_ADDRESS`
- **IMPORTS**: `import { type FormEvent, useRef, useState } from 'react'` / `import { AddressSearchDialog } from './address-search-dialog'` / `import type { DaumPostcodeData } from './use-daum-postcode'`
- **GOTCHA**:
  - `AddressCard.patchDefault()` 는 `address.address` 를 그대로 재전송 → 구조화 필드 없이도 깨지면 안 됨. 백엔드는 두 방식 모두 수용해야 함(백엔드 계획서 하위호환 항목)
  - `form.reset()` 은 controlled state 를 되돌리지 않음 → 신규 저장 성공 시 `setZipcode('')`/`setBase('')`/`setDetail('')` 도 직접 호출
  - `readOnly` 인 `required` input 은 빈 값이면 브라우저 검증에서 막힘 → 위젯 미사용 제출 시 "주소 검색을 눌러 주소를 선택하세요" 에러를 `setError` 로 명시
- **VALIDATE**: `/account/addresses` 에서 주소 검색 → 필드 채움 → 저장 성공. 편집 모드에서 기존 주소가 base/detail 로 분해되어 보임

### Task 5: `address-form.test.tsx`
- **ACTION**: `apps/web/components/address-form.test.tsx` 생성
- **IMPLEMENT**:
  - `vi.mock('./use-daum-postcode', ...)` — `useDaumPostcode` 가 `load: () => Promise.resolve(PostcodeMock)` 반환. `PostcodeMock` 은 생성 시 `opts` 보관, `embed()` 호출 시 테스트가 `opts.oncomplete(SAMPLE_DATA)` 를 트리거할 수 있게
  - `vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))`
  - `vi.mock('./toast', () => ({ useToast: () => ({ show: vi.fn() }) }))`
  - 케이스:
    1. 렌더 시 "주소 검색" 버튼 존재, 우편번호/기본주소 input 은 `readOnly`
    2. 버튼 클릭 → `role="dialog"` 등장
    3. `oncomplete(SAMPLE_DATA)` → 우편번호 `01234`, 기본 주소 `roadAddress (bname, buildingName)`, 다이얼로그 닫힘
    4. 저장 클릭 → `fetch` 가 `/api/address` `POST`, body 의 `zipcode`/`address` 가 채워진 값
    5. 위젯 미사용 저장 → 에러박스, `fetch` 미호출
  - `SAMPLE_DATA = { zonecode: '01234', roadAddress: '서울 성동구 왕십리로 222', jibunAddress: '서울 성동구 행당동 1-1', userSelectedType: 'R', bname: '행당동', buildingName: '한양대', sido: '서울', sigungu: '성동구', autoRoadAddress: '', autoJibunAddress: '' }`
- **MIRROR**: `COMPONENT_TEST` (checkout-form.test.tsx)
- **IMPORTS**: 위 패턴 그대로
- **GOTCHA**: `AddressForm` 은 `router.refresh` 호출 → mock 포함. `form.reset()` + state 초기화 동작도 케이스 4 이후 확인
- **VALIDATE**: `npx vitest run apps/web/components/address-form.test.tsx` 초록

---

## Testing Strategy

### Unit Tests
| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| readOnly 입력 | 초기 렌더 | 우편번호·기본주소 input `readOnly` 속성 | |
| 모달 오픈 | "주소 검색" 클릭 | `role="dialog"` 노출 | |
| oncomplete 채움 (도로명) | `userSelectedType:'R'` SAMPLE_DATA | zipcode=zonecode, base=`roadAddress (bname, buildingName)` | |
| oncomplete 채움 (지번) | `userSelectedType:'J'` | base=`jibunAddress`, 참고항목 없음 | ✅ |
| 참고항목 없음 | `bname:'' buildingName:''` | base=road 만, 괄호 없음 | ✅ |
| 저장 payload | 채운 뒤 submit | `fetch('/api/address', { method:'POST', body 포함 zipcode/address })` | |
| 위젯 미사용 저장 | 빈 주소로 submit | 에러박스, `fetch` 미호출 | ✅ |
| 편집 모드 초기값 | `address="A  B"` 로 렌더 | base=`A`, detail=`B` (`splitAddress`) | ✅ |
| 저장 성공 후 초기화 | 신규 저장 200 | state 3개 공백으로 리셋 | ✅ |

### Edge Cases Checklist
- [x] 빈 입력 (위젯 미사용 제출)
- [x] 지번 선택 (`userSelectedType==='J'`)
- [x] 참고항목(법정동/건물명) 빈 값
- [ ] 스크립트 로드 실패 → 다이얼로그가 에러 메시지 + 닫기 (Task 3, 수동 확인 권장)
- [x] 편집 모드 하위호환(`splitAddress`)
- [ ] CSP 위반 없이 실제 위젯 iframe 로드 (수동/브라우저)

---

## Validation Commands

### Static Analysis
```bash
npm run typecheck --workspace @omi/web
npm run lint --workspace @omi/web
```
EXPECT: 타입 에러 0, lint 에러 0

### Unit Tests
```bash
npx vitest run apps/web/components/address-form.test.tsx
```
EXPECT: 전부 통과

### Full Test Suite
```bash
npm test
```
EXPECT: 회귀 없음 (`checkout-form`, `contract-drift` 등 기존 그대로)

### Browser Validation
```bash
npm run dev:web
# http://localhost:3000/account/addresses (로그인 필요)
```
- [ ] "주소 검색" → 모달에 Daum 위젯 iframe 표시 (콘솔 CSP 위반 없음)
- [ ] 주소 선택 → 우편번호·기본 주소 자동 채움, 상세 주소로 포커스 이동
- [ ] 저장 → 토스트 "배송지를 추가했습니다." + 목록 갱신
- [ ] 기존 주소 "수정" → base/detail 정상 분해, 재검색·저장 동작
- [ ] `curl -sI http://localhost:3000/ | grep -i content-security` → daum 도메인 포함

### Manual Validation
- [ ] 모바일 폭(≤480px)에서 모달·위젯 스크롤 정상
- [ ] `Esc`/배경 클릭으로 모달 닫힘, 닫은 뒤 포커스가 "주소 검색" 버튼으로 복원

---

## Acceptance Criteria
- [ ] 모든 Task 완료
- [ ] 모든 validation 커맨드 통과
- [ ] `address-form.test.tsx` 작성·통과
- [ ] 타입/lint 에러 없음
- [ ] CSP 헤더에 Daum 도메인 반영, 위젯 실제 로드 확인
- [ ] 편집 모드 하위호환 유지(`splitAddress`)

## Completion Checklist
- [ ] `'use client'` + import 순서 기존 컨벤션 준수
- [ ] 모달은 `confirm-dialog.tsx` 접근성 패턴(포커스 복원, Esc, `aria-modal`) 재사용
- [ ] 에러 표시는 `FormErrorBox` / 성공은 `useToast().show`
- [ ] 테스트는 `checkout-form.test.tsx` 패턴(`vi.stubGlobal('fetch')`, `vi.mock('next/navigation')`)
- [ ] 하드코딩된 스크립트 URL 은 훅 상단 상수 1곳
- [ ] 스코프 밖(체크아웃 인라인 입력, mobile, alias UI) 손대지 않음
- [ ] 백엔드 미적용 상태에서도 단일 `address` 문자열로 저장 동작

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| CSP 누락으로 위젯이 조용히 안 뜸 | 높음 | 높음 | Task 1 을 먼저, 브라우저 콘솔·`curl -I` 로 검증 |
| `embed()` 재사용 시 빈 iframe | 중간 | 중간 | open 마다 컨테이너 `innerHTML=''` + 새 인스턴스 |
| `form.reset()` 이 controlled state 안 되돌림 | 중간 | 낮음 | 저장 성공 시 setter 로 명시적 초기화 |
| 백엔드 구조화 필드 계약 미확정 | 중간 | 낮음 | 조건부 필드로 설계, 기존 `address` 문자열 항상 전송 |
| Daum 위젯 스크립트 CDN 장애 | 낮음 | 중간 | 로드 실패 시 다이얼로그에 에러 + 수기 입력 fallback (readOnly 해제 버튼 고려) |

## Notes
- 이 repo 는 `next/script` 사용처가 0건이라 수동 스크립트 주입 훅으로 통일했다. 팀이 `next/script` 표준화를 원하면 Task 2 를 `<Script strategy="lazyOnload">` 로 대체 가능하나, 콜백 타이밍 제어는 훅 쪽이 단순하다.
- `checkout-form.tsx` 는 저장된 주소를 선택만 하므로 이번 스코프에서 제외.
- 백엔드 계획서(`../omisys/docs/plans/address-search-backend.plan.md`)의 "주소 모델 구조화" 가 머지되면 Task 4-10 의 구조화 필드 전송을 활성화하고 `contracts.ts` `addressSchema` 확장 + `npm run contracts:sync` 필요.
