// zod 계약과 백엔드 OpenAPI 스펙을 대조한다.
//
// 왜 "샘플 생성 후 parse" 가 아니라 "키/타입 대조" 인가: zod 스키마에는 `.url()`,
// `.uuid()`, `.email()` 같은 refinement 이 붙어 있어, 스펙의 `type: string` 만 보고
// 만든 샘플은 대량으로 거짓 실패한다. 실제로 이 저장소에서 터진 계약 사고
// (B1/B5/B6/D1)는 전부 **키 이름** 문제였다. 키 존재를 주 방어선으로 삼는다.
//
// 이 모듈은 `openapi-spec.ts` 와 함께 테스트 전용이다. `index.ts` 에서 export 하지 말 것.

import type { z } from 'zod'

import { resolveRef, type JsonSchema, type OpenApiDoc } from './openapi-spec'

export interface DriftReport {
  /** zod 가 필수로 요구하지만 스펙에 없는 키. 채워지면 화면이 깨진다. */
  missingInSpec: string[]
  /** 스펙에 있으나 zod 가 모르는 키. 정보성 — 비-strict 스키마라 무해하다. */
  missingInZod: string[]
  /** 양쪽에 있으나 JSON 타입이 어긋나는 키. */
  typeMismatch: string[]
  /** 판별하지 못한 키. 침묵시키지 않고 드러낸다 — 검사하지 않은 것과 같기 때문이다. */
  unresolved: string[]
}

export interface SpecDefect {
  service: string
  method: string
  path: string
  reason: string
}

/**
 * springdoc 이 내부 클래스를 simple name 으로 등록해 서로 다른 DTO 가 같은 컴포넌트
 * 이름을 덮어쓴다(`springdoc.use-fqn` 미설정). 아래 경로는 스펙이 **다른 리소스의 DTO**
 * 를 기술하고 있어 대조할 수 없다.
 *
 * 백엔드에서 `@Schema(name = "...")` 를 부여해 고친 뒤 이 목록에서 제거하고
 * 드리프트 테스트에 케이스를 추가할 것. 각 항목의 런타임 정합은 백엔드 소스로 확인했다.
 */
export const KNOWN_SPEC_DEFECTS: readonly SpecDefect[] = [
  {
    service: 'user',
    method: 'GET',
    path: '/api/address/me',
    reason:
      'user.json 의 `Get` 을 address/point/tier 세 리소스가 공유하며 기록된 값은 tier 형태다. ' +
      '실제 응답은 AddressResponse.Get {id,userId,alias,recipient,phoneNumber,zipcode,address,isDefault} 로 ' +
      'addressSchema 와 일치함을 백엔드 소스로 확인했다.',
  },
  {
    service: 'user',
    method: 'GET',
    path: '/api/users/point/me',
    reason:
      'user.json 의 `Get` 이름 충돌. 실제 응답은 PointResponse.Get 이며 pointSchema 와 일치함을 백엔드 소스로 확인했다.',
  },
  {
    service: 'promotion',
    method: 'GET',
    path: '/api/coupons/me',
    reason:
      'promotion.json 의 `Get` 을 coupon/event 가 공유하며 기록된 값은 event 형태다. 실제 응답은 ' +
      'CouponResponse.Get {couponId,name,type,discountType,discountValue,minBuyPrice,maxDiscountPrice,' +
      'quantity,startDate,endDate,userTier,eventId} 로 couponSchema 와 일치함을 백엔드 소스로 확인했다.',
  },
  {
    service: 'user',
    method: 'POST',
    path: '/api/address',
    reason:
      'user.json 의 `Create` 를 address/tier/users 가 공유하며 기록된 값은 sign-up 형태다. ' +
      'address 요청 본문은 스펙으로 검증할 수 없다.',
  },
]

/** zod 래퍼 종류. 안쪽 타입을 꺼내야 실제 JSON 타입을 알 수 있다. */
const WRAPPER_KINDS = new Set([
  'optional',
  'nullable',
  'default',
  'prefault',
  'catch',
  'readonly',
  'nonoptional',
  'pipe',
  'effects',
  'transform',
])

const JSON_TYPES_BY_KIND: Record<string, readonly string[]> = {
  string: ['string'],
  number: ['number', 'integer'],
  int: ['number', 'integer'],
  bigint: ['integer', 'string'],
  boolean: ['boolean'],
  array: ['array'],
  object: ['object'],
  date: ['string'],
}

/** 판별해도 의미가 없는 종류 — 어떤 JSON 타입과도 맞을 수 있다. */
const PERMISSIVE_KINDS = new Set(['any', 'unknown', 'union', 'enum', 'literal', 'record', 'lazy'])

const MAX_UNWRAP_DEPTH = 10

interface ZodInternals {
  _zod?: { def?: { type?: string; innerType?: unknown; in?: unknown; coerce?: boolean } }
  _def?: {
    typeName?: string
    innerType?: unknown
    schema?: unknown
    in?: unknown
    coerce?: boolean
  }
}

/**
 * zod 의 내부 표현을 읽는 유일한 지점. v4 는 `_zod.def.type`, v3 는 `_def.typeName` 을 쓴다.
 * 판별에 실패하면 null 을 돌려 호출자가 `unresolved` 로 기록하게 한다.
 */
function zodKind(schema: unknown): string | null {
  const node = schema as ZodInternals
  const v4 = node._zod?.def?.type
  if (typeof v4 === 'string') return v4

  const v3 = node._def?.typeName
  if (typeof v3 === 'string') return v3.replace(/^Zod/, '').toLowerCase()

  return null
}

function zodCoerces(schema: unknown): boolean {
  const node = schema as ZodInternals
  return node._zod?.def?.coerce === true || node._def?.coerce === true
}

function innerSchema(schema: unknown): unknown {
  const def = (schema as ZodInternals)._zod?.def ?? (schema as ZodInternals)._def
  if (!def) return undefined
  return def.innerType ?? def.in ?? (def as { schema?: unknown }).schema
}

/** `.optional().nullable().default(...)` 처럼 겹쳐 감싼 래퍼를 벗겨 안쪽 타입을 얻는다. */
export function unwrapZod(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current: unknown = schema
  for (let depth = 0; depth < MAX_UNWRAP_DEPTH; depth += 1) {
    const kind = zodKind(current)
    if (!kind || !WRAPPER_KINDS.has(kind)) break

    const inner = innerSchema(current)
    if (!inner) break
    current = inner
  }
  return current as z.ZodTypeAny
}

/**
 * 필수 여부는 공개 API 로 판정한다. `undefined` 가 통과하면 와이어에 없어도 되는 필드다.
 * `.default(...)`/`.optional()`/`.catch(...)` 를 한 번에 올바르게 다룬다.
 *
 * 주의: `z.coerce.string()` 은 `String(undefined)` 가 통과해 optional 로 보인다.
 * 현재 계약에는 `z.coerce.number()` 만 쓰이고 그쪽은 NaN 이라 정상 판정된다.
 */
function isOptionalField(field: z.ZodTypeAny): boolean {
  return field.safeParse(undefined).success
}

function specTypeOf(doc: OpenApiDoc, node: JsonSchema): string | undefined {
  const resolved = node.$ref ? resolveRef(doc, node) : node
  if (resolved.type) return resolved.type
  return resolved.properties ? 'object' : undefined
}

function acceptedJsonTypes(field: z.ZodTypeAny, kind: string): readonly string[] | null {
  if (PERMISSIVE_KINDS.has(kind)) return null

  const base = JSON_TYPES_BY_KIND[kind]
  if (!base) return null

  // `z.coerce.number()` 는 문자열도 받는다. BigDecimal/Timestamp 가 문자열로
  // 직렬화되는 백엔드라 이걸 불일치로 보면 거짓 양성이 된다.
  return zodCoerces(field) ? [...base, 'string'] : base
}

/**
 * zod 객체 스키마와 스펙 스키마의 속성을 대조한다.
 * `spec` 은 봉투/페이지를 벗긴 뒤의 DTO 노드여야 한다.
 */
export function compareShape(schema: z.ZodTypeAny, spec: JsonSchema, doc: OpenApiDoc): DriftReport {
  const target = unwrapZod(schema)
  if (zodKind(target) !== 'object') {
    throw new Error('객체 스키마가 아닙니다. 배열/페이지는 아이템으로 풀어서 넘기세요.')
  }

  // zod v4 의 `ZodObject['shape']` 값 타입은 `$ZodType` 이라 `ZodTypeAny` 로 바로 쓰이지 않는다.
  // 내부 표현 차이를 흡수하려고 여기서 한 번만 좁힌다.
  const shape = (target as unknown as { shape: Record<string, z.ZodTypeAny> }).shape
  const specProperties = spec.properties ?? {}

  const report: DriftReport = {
    missingInSpec: [],
    missingInZod: [],
    typeMismatch: [],
    unresolved: [],
  }

  for (const [key, field] of Object.entries(shape)) {
    const specNode = specProperties[key]
    if (!specNode) {
      if (!isOptionalField(field)) report.missingInSpec.push(key)
      continue
    }

    const inner = unwrapZod(field)
    const kind = zodKind(inner)
    if (!kind) {
      report.unresolved.push(`${key}: zod 종류를 판별하지 못했습니다`)
      continue
    }

    const accepted = acceptedJsonTypes(inner, kind)
    if (!accepted) {
      report.unresolved.push(`${key}: zod ${kind} 는 타입 대조를 건너뜁니다`)
      continue
    }

    const specType = specTypeOf(doc, specNode)
    if (specType && !accepted.includes(specType)) {
      report.typeMismatch.push(`${key}: zod ${kind} vs spec ${specType}`)
    }
  }

  for (const key of Object.keys(specProperties)) {
    if (!(key in shape)) report.missingInZod.push(key)
  }

  return report
}
