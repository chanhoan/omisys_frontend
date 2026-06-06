export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface TokenStore {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
}

const REFRESH_TOKEN_KEY = 'omi.refresh-token'

export class AuthSession {
  private accessToken?: string

  constructor(private readonly store: TokenStore) {}

  getAccessToken(): string | undefined {
    return this.accessToken
  }

  getRefreshToken(): Promise<string | null> {
    return this.store.get(REFRESH_TOKEN_KEY)
  }

  async setTokens(tokens: TokenPair): Promise<void> {
    this.accessToken = tokens.accessToken
    await this.store.set(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  async clear(): Promise<void> {
    this.accessToken = undefined
    await this.store.remove(REFRESH_TOKEN_KEY)
  }
}
