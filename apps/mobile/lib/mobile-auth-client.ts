import { apiResponseSchema, type SignInRequest, tokenPairSchema } from '@omi/api'

import type { AuthSession } from './auth-session'

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

interface MobileAuthClientOptions {
  baseUrl: string
  session: AuthSession
  fetcher?: Fetcher
}

export class MobileAuthClient {
  private readonly baseUrl: string
  private readonly session: AuthSession
  private readonly fetcher: Fetcher

  constructor(options: MobileAuthClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.session = options.session
    this.fetcher = options.fetcher ?? fetch
  }

  async signIn(request: SignInRequest): Promise<void> {
    const tokens = await this.requestTokens('/api/auth/mobile/sign-in', request)
    await this.session.setTokens(tokens)
  }

  async refresh(): Promise<void> {
    const refreshToken = await this.session.getRefreshToken()
    if (!refreshToken) throw new Error('저장된 로그인 정보가 없습니다.')
    const tokens = await this.requestTokens('/api/auth/mobile/refresh', { refreshToken })
    await this.session.setTokens(tokens)
  }

  async signOut(): Promise<void> {
    const refreshToken = await this.session.getRefreshToken()
    try {
      const response = await this.fetcher(`${this.baseUrl}/api/auth/mobile/sign-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!response.ok) throw new Error('로그아웃 요청을 처리하지 못했습니다.')
    } finally {
      await this.session.clear()
    }
  }

  private async requestTokens(path: string, request: unknown) {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error('인증 요청을 처리하지 못했습니다.')
    const payload = apiResponseSchema(tokenPairSchema).parse(await response.json())
    return payload.data
  }
}
