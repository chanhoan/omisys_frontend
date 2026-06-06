import { describe, expect, it } from 'vitest'

import { AuthSession } from './auth-session'

describe('AuthSession', () => {
  it('keeps access tokens in memory and persists refresh tokens only', async () => {
    const values = new Map<string, string>()
    const store = {
      get: async (key: string) => values.get(key) ?? null,
      set: async (key: string, value: string) => { values.set(key, value) },
      remove: async (key: string) => { values.delete(key) },
    }
    const session = new AuthSession(store)

    await session.setTokens({ accessToken: 'access', refreshToken: 'refresh' })

    expect(session.getAccessToken()).toBe('access')
    expect(values.get('omi.refresh-token')).toBe('refresh')
    expect([...values.values()]).not.toContain('access')
  })

  it('restores refresh state without inventing an access token', async () => {
    const store = {
      get: async () => 'stored-refresh',
      set: async () => undefined,
      remove: async () => undefined,
    }
    const session = new AuthSession(store)

    await expect(session.getRefreshToken()).resolves.toBe('stored-refresh')
    expect(session.getAccessToken()).toBeUndefined()
  })

  it('clears memory and secure storage on sign out', async () => {
    let removed = false
    const store = {
      get: async () => null,
      set: async () => undefined,
      remove: async () => { removed = true },
    }
    const session = new AuthSession(store)
    await session.setTokens({ accessToken: 'access', refreshToken: 'refresh' })

    await session.clear()

    expect(session.getAccessToken()).toBeUndefined()
    expect(removed).toBe(true)
  })
})
