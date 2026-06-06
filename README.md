# OMI Frontend

OMISYS 백엔드와 연계되는 고객용 패션 커머스 프론트엔드입니다. 웹은 Next.js, iOS/Android 앱은 Expo로 개발하며 API 계약과 도메인 로직을 공유합니다.

## 구조

```text
apps/
  web/       Next.js App Router 웹
  mobile/    Expo Router iOS/Android 앱
packages/
  api/       OMISYS API envelope, 스키마, 클라이언트, 프록시 보안
  domain/    상품 표시·정렬 로직과 개발 fixture
reference/   디자인 참고 자료(제품 구조의 기준이 아님)
```

화면과 내비게이션은 플랫폼별로 최적화합니다. API 타입, Zod 검증, 가격·상품 파생 상태는 공유 패키지를 사용합니다.

## 시작

```bash
npm install
cp .env.example .env.local
npm run dev:web
npm run dev:mobile
```

- 웹: `http://localhost:3000`
- Android 에뮬레이터 API: `EXPO_PUBLIC_OMISYS_GATEWAY_URL=http://10.0.2.2:19091`
- iOS 시뮬레이터 API: `http://localhost:19091`
- 실제 기기 API: 개발 PC의 LAN 주소 사용

## 검증

```bash
npm test
npm run typecheck
npm run build --workspace @omi/web
cd apps/mobile
HOME=/tmp/omi-home EXPO_NO_TELEMETRY=1 \
  npx expo export --platform android --output-dir /tmp/omi-expo-export
```

## 연동 상태

현재 화면은 `ProductResponse`와 같은 shape의 fixture로 독립 실행됩니다. 실제 백엔드 연동에 필요한 변경은 [backend-contract.md](docs/backend-contract.md)에 정의되어 있습니다.

- Next 웹은 동일 출처 `/api/*` Route Handler를 거쳐 Gateway와 통신합니다.
- 웹 인증은 Gateway의 HttpOnly cookie를 사용합니다.
- 앱 인증은 Bearer access token과 SecureStore refresh token 계약을 요구합니다.
- 앱 결제 복귀 스킴은 `omi://payments/result`입니다.

## 보안 원칙

- access/refresh token을 `localStorage`나 로그에 기록하지 않습니다.
- Next 프록시는 `/api/*`만 전달하며 `/internal/*`, 절대 URL, traversal을 차단합니다.
- 사용자 입력과 백엔드 응답은 공유 Zod schema로 검증합니다.
- 결제 주문 생성은 서버의 `Idempotency-Key` 지원 전제입니다.
