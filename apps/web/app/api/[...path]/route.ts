import { createGatewayPath } from '@omi/api'
import { NextResponse } from 'next/server'

const FORWARDED_REQUEST_HEADERS = [
  'accept',
  'content-type',
  'cookie',
  'idempotency-key',
  'x-csrf-token',
] as const

const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'retry-after',
  'x-queue-rank',
] as const

interface RouteContext {
  params: Promise<{ path: string[] }>
}

async function proxy(request: Request, context: RouteContext): Promise<Response> {
  const gatewayUrl = process.env.OMISYS_GATEWAY_URL
  if (!gatewayUrl) {
    return NextResponse.json(
      { statusName: 'SERVICE_UNAVAILABLE', message: '백엔드 연결이 설정되지 않았습니다.', data: null },
      { status: 503 },
    )
  }

  try {
    const { path } = await context.params
    const sourceUrl = new URL(request.url)
    const gatewayPath = createGatewayPath(path, sourceUrl.searchParams)
    const headers = new Headers()
    for (const name of FORWARDED_REQUEST_HEADERS) {
      const value = request.headers.get(name)
      if (value) headers.set(name, value)
    }

    const upstream = await fetch(`${gatewayUrl.replace(/\/$/, '')}${gatewayPath}`, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    })
    const responseHeaders = new Headers()
    for (const name of FORWARDED_RESPONSE_HEADERS) {
      const value = upstream.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }
    for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append('set-cookie', cookie)

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    const message = error instanceof Error && error.name === 'TimeoutError'
      ? '백엔드 응답 시간이 초과되었습니다.'
      : '백엔드 요청을 처리하지 못했습니다.'
    return NextResponse.json(
      { statusName: 'BAD_GATEWAY', message, data: null },
      { status: 502 },
    )
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
