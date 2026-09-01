// 백엔드가 커밋한 OpenAPI 스펙(`contracts/openapi/*.json`)을 읽어 계약 대조에 쓸 모양으로 꺼낸다.
//
// 이 모듈은 `node:fs` 를 쓰므로 Node 전용이다. `index.ts` 에서 export 하지 말 것 —
// `@omi/api` 는 브라우저 번들에도 들어가고, 배럴에 넣으면 클라이언트 빌드가 깨진다.
// 테스트가 상대경로로 직접 import 한다.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SPEC_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'contracts', 'openapi')
const REF_PREFIX = '#/components/schemas/'
const OK_STATUS = '200'
// springdoc 은 응답을 `*/*` 로 낸다. 요청 본문만 `application/json` 이다.
const RESPONSE_CONTENT_TYPE = '*/*'
const REQUEST_CONTENT_TYPE = 'application/json'

export interface JsonSchema {
  type?: string
  format?: string
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  required?: string[]
  $ref?: string
}

interface MediaType {
  schema?: JsonSchema
}

interface Operation {
  requestBody?: { content?: Record<string, MediaType> }
  responses?: Record<string, { content?: Record<string, MediaType> }>
}

export interface OpenApiDoc {
  paths: Record<string, Record<string, Operation>>
  components: { schemas: Record<string, JsonSchema> }
}

const specs = new Map<string, OpenApiDoc>()

export function loadSpec(service: string): OpenApiDoc {
  const cached = specs.get(service)
  if (cached) return cached

  const path = join(SPEC_DIR, `${service}.json`)
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    throw new Error(`스펙이 없습니다: ${path} — npm run contracts:sync 를 먼저 실행하세요.`)
  }

  const doc = JSON.parse(raw) as OpenApiDoc
  specs.set(service, doc)
  return doc
}

/**
 * `$ref` 를 한 단계만 푼다. 재귀하지 않으므로 자기참조 스키마
 * (`CategoryResponse.subCategories`)에도 무한루프가 없다.
 */
export function resolveRef(doc: OpenApiDoc, node: JsonSchema | undefined): JsonSchema {
  if (!node) throw new Error('스키마 노드가 없습니다.')
  if (!node.$ref) return node

  if (!node.$ref.startsWith(REF_PREFIX)) {
    throw new Error(`해석할 수 없는 참조입니다: ${node.$ref}`)
  }
  const name = node.$ref.slice(REF_PREFIX.length)
  const target = doc.components.schemas[name]
  if (!target) throw new Error(`스펙에 없는 스키마입니다: ${name}`)
  return target
}

function operation(doc: OpenApiDoc, method: string, path: string): Operation {
  const op = doc.paths[path]?.[method.toLowerCase()]
  if (!op) throw new Error(`스펙에 없는 오퍼레이션입니다: ${method.toUpperCase()} ${path}`)
  return op
}

export function responseSchema(doc: OpenApiDoc, method: string, path: string): JsonSchema {
  const media = operation(doc, method, path).responses?.[OK_STATUS]?.content?.[RESPONSE_CONTENT_TYPE]
  if (!media) throw new Error(`${method.toUpperCase()} ${path} 에 ${OK_STATUS} 응답 본문이 없습니다.`)
  return resolveRef(doc, media.schema)
}

export function requestSchema(doc: OpenApiDoc, method: string, path: string): JsonSchema {
  const media = operation(doc, method, path).requestBody?.content?.[REQUEST_CONTENT_TYPE]
  if (!media) throw new Error(`${method.toUpperCase()} ${path} 에 요청 본문이 없습니다.`)
  return resolveRef(doc, media.schema)
}

/** `ApiResponseXxx { statusName, message, data }` 에서 `data` 를 꺼낸다. */
export function unwrapEnvelope(doc: OpenApiDoc, node: JsonSchema): JsonSchema {
  const data = node.properties?.data
  if (!data) throw new Error('봉투에 data 속성이 없습니다.')
  return resolveRef(doc, data)
}

/** Spring `Page<T>` 와 커스텀 `PageResponse<T>` 공통으로 `content` 의 아이템을 꺼낸다. */
export function unwrapPage(doc: OpenApiDoc, node: JsonSchema): JsonSchema {
  const content = node.properties?.content
  if (!content?.items) throw new Error('페이지에 content 배열이 없습니다.')
  return resolveRef(doc, content.items)
}

export function unwrapArray(doc: OpenApiDoc, node: JsonSchema): JsonSchema {
  if (!node.items) throw new Error('배열 스키마가 아닙니다.')
  return resolveRef(doc, node.items)
}

/** 서비스 이름 + 오퍼레이션에서 봉투를 벗긴 응답 스키마를 한 번에 얻는다. */
export function envelopeOf(service: string, method: string, path: string): { doc: OpenApiDoc; schema: JsonSchema } {
  const doc = loadSpec(service)
  return { doc, schema: unwrapEnvelope(doc, responseSchema(doc, method, path)) }
}
