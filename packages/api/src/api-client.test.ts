import { describe, expect, it } from 'vitest'

import { ApiError, OmiApiClient, QueueRequiredError } from './api-client'

describe('OmiApiClient', () => {
  it('unwraps successful ApiResponse data', async () => {
    const fetcher = async () => new Response(JSON.stringify({ statusName: 'OK', message: null, data: { id: 1 } }))
    const client = new OmiApiClient({ baseUrl: 'https://api.example.com', fetcher })

    await expect(client.get('/api/products/search/1')).resolves.toEqual({ id: 1 })
  })

  it('converts a queue response into QueueRequiredError', async () => {
    const fetcher = async () => new Response(JSON.stringify({
      statusName: 'ACCEPTED',
      message: null,
      data: { state: 'WAITING', rank: 7, retryAfterSeconds: 3 },
    }), {
      status: 202,
      headers: { 'Retry-After': '3' },
    })
    const client = new OmiApiClient({ baseUrl: 'https://api.example.com', fetcher })

    await expect(client.get('/api/orders/me')).rejects.toEqual(
      new QueueRequiredError(7, 3),
    )
  })

  it('temporarily supports the legacy queue header during gateway rollout', async () => {
    const client = new OmiApiClient({
      baseUrl: 'https://api.example.com',
      fetcher: async () => new Response('', {
        status: 202,
        headers: { 'X-Queue-Rank': '7', 'Retry-After': '3' },
      }),
    })

    await expect(client.get('/api/orders/me')).rejects.toEqual(new QueueRequiredError(7, 3))
  })

  it('does not mistake a non-queue accepted response for queue admission', async () => {
    const client = new OmiApiClient({
      baseUrl: 'https://api.example.com',
      fetcher: async () => new Response(JSON.stringify({
        statusName: 'BAD_GATEWAY',
        message: 'Queue response is unavailable',
        data: null,
      }), { status: 202 }),
    })

    await expect(client.get('/api/orders/me')).resolves.toBeNull()
  })

  it('refreshes once after unauthorized and retries the original request', async () => {
    const paths: string[] = []
    const fetcher = async (input: RequestInfo | URL) => {
      const path = new URL(String(input)).pathname
      paths.push(path)
      if (paths.length === 1) return new Response('', { status: 401 })
      if (path === '/api/auth/refresh') {
        return new Response(JSON.stringify({ statusName: 'OK', message: null, data: null }))
      }
      return new Response(JSON.stringify({ statusName: 'OK', message: null, data: ['order'] }))
    }
    const client = new OmiApiClient({ baseUrl: 'https://api.example.com', fetcher })

    await expect(client.get('/api/orders/me')).resolves.toEqual(['order'])
    expect(paths).toEqual(['/api/orders/me', '/api/auth/refresh', '/api/orders/me'])
  })

  it('throws a typed ApiError for backend errors', async () => {
    const fetcher = async () => new Response(
      JSON.stringify({ statusName: 'BAD_REQUEST', message: '잘못된 요청입니다.', data: null }),
      { status: 400 },
    )
    const client = new OmiApiClient({ baseUrl: 'https://api.example.com', fetcher })

    await expect(client.get('/api/products')).rejects.toEqual(
      new ApiError(400, 'BAD_REQUEST', '잘못된 요청입니다.'),
    )
  })

  it('sends JSON and bearer authorization for native mutations', async () => {
    let requestInit: RequestInit | undefined
    const fetcher = async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestInit = init
      return new Response(JSON.stringify({ statusName: 'CREATED', message: null, data: 91 }))
    }
    const client = new OmiApiClient({
      baseUrl: 'https://api.example.com/',
      fetcher,
      getAccessToken: () => 'access-token',
    })

    await expect(client.post('/api/orders', { addressId: 3 })).resolves.toBe(91)
    const headers = new Headers(requestInit?.headers)
    expect(headers.get('Authorization')).toBe('Bearer access-token')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(requestInit?.body).toBe(JSON.stringify({ addressId: 3 }))
  })

  it('returns null for an empty successful response', async () => {
    const client = new OmiApiClient({
      baseUrl: 'https://api.example.com',
      fetcher: async () => new Response(null, { status: 204 }),
    })

    await expect(client.post('/api/auth/sign-out')).resolves.toBeNull()
  })

  it('reports an expired session when refresh fails', async () => {
    const client = new OmiApiClient({
      baseUrl: 'https://api.example.com',
      fetcher: async () => new Response('', { status: 401 }),
    })

    await expect(client.get('/api/orders/me')).rejects.toEqual(
      new ApiError(401, 'UNAUTHORIZED', '로그인이 만료되었습니다.'),
    )
  })
})
