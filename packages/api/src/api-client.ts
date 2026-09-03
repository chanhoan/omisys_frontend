import { z } from 'zod'

import { queueApiResponseSchema } from './contracts'

const errorResponseSchema = z.object({
  statusName: z.string(),
  message: z.string().nullable(),
  data: z.unknown(),
})

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface OmiApiClientOptions {
  baseUrl: string
  fetcher?: Fetcher
  getAccessToken?: () => string | undefined
  onTokensRefreshed?: (response: Response) => Promise<void> | void
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly statusName: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class QueueRequiredError extends Error {
  constructor(
    readonly rank: number,
    readonly retryAfterSeconds: number,
  ) {
    super(`Queue position ${rank}`)
    this.name = 'QueueRequiredError'
  }
}

export class OmiApiClient {
  private readonly baseUrl: string
  private readonly fetcher: Fetcher
  private readonly getAccessToken?: () => string | undefined
  private readonly onTokensRefreshed?: (response: Response) => Promise<void> | void

  constructor(options: OmiApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.fetcher = options.fetcher ?? fetch
    this.getAccessToken = options.getAccessToken
    this.onTokensRefreshed = options.onTokensRefreshed
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' })
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  private async request<T>(path: string, init: RequestInit, canRefresh = true): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (init.body) headers.set('Content-Type', 'application/json')

    const accessToken = this.getAccessToken?.()
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers,
    })

    if (response.status === 401 && canRefresh && path !== '/api/auth/refresh') {
      await this.refresh()
      return this.request<T>(path, init, false)
    }

    const payload = await this.readPayload(response)
    const queueRank = response.headers.get('X-Queue-Rank')
    if (response.status === 202) {
      const queued = queueApiResponseSchema.safeParse(payload)
      if (queued.success && queued.data.data.state === 'WAITING') {
        throw new QueueRequiredError(
          queued.data.data.rank,
          queued.data.data.retryAfterSeconds,
        )
      }

      // During the coordinated gateway rollout, retain the legacy header
      // fallback for older gateway instances. New code must use the envelope.
      if (queueRank) {
        throw new QueueRequiredError(
          Number(queueRank),
          Number(response.headers.get('Retry-After') ?? 3),
        )
      }
    }

    if (!response.ok) {
      const error = errorResponseSchema.parse(payload)
      throw new ApiError(response.status, error.statusName, error.message ?? '요청을 처리하지 못했습니다.')
    }

    return (payload as { data: T }).data
  }

  /**
   * 계약상의 `POST /api/auth/refresh` 연결점. 401 을 받으면 한 번만 갱신하고 재시도한다.
   *
   * 서버 컴포넌트 경로(`apps/web/lib/server-fetch.ts`)에는 이 흐름이 없다 — 서버 렌더는
   * 만료 시 `null` 을 돌려 로그인으로 유도하는 편이 맞다. 갱신 엔드포인트가 프론트에
   * 연결되어 있지 않은 것이 아니라, 여기 한 곳에 모여 있는 것이다.
   */
  private async refresh(): Promise<void> {
    const response = await this.fetcher(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new ApiError(response.status, 'UNAUTHORIZED', '로그인이 만료되었습니다.')
    }
    await this.onTokensRefreshed?.(response)
  }

  private async readPayload(response: Response): Promise<unknown> {
    const text = await response.text()
    return text ? JSON.parse(text) : { statusName: 'OK', message: null, data: null }
  }
}
