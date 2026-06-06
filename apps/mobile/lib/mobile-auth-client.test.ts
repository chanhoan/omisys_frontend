import { describe, expect, it } from 'vitest'

import { AuthSession } from './auth-session'
import { MobileAuthClient } from './mobile-auth-client'

function setup() {
  const values = new Map<string, string>()
  const session = new AuthSession({
    get: async (key) => values.get(key) ?? null,
    set: async (key, value) => { values.set(key, value) },
    remove: async (key) => { values.delete(key) },
  })
  return { session, values }
}

describe('MobileAuthClient', () => {
  it('signs in and stores rotated tokens through AuthSession', async () => {
    const { session, values } = setup()
    const client = new MobileAuthClient({
      baseUrl: 'https://api.example.com',
      session,
      fetcher: async (_input, init) => {
        expect(init?.body).toBe(JSON.stringify({ username: 'omi-user', password: 'password123!' }))
        return new Response(JSON.stringify({
          statusName: 'OK', message: null, data: { accessToken: 'access', refreshToken: 'refresh' },
        }))
      },
    })

    await client.signIn({ username: 'omi-user', password: 'password123!' })

    expect(session.getAccessToken()).toBe('access')
    expect(values.get('omi.refresh-token')).toBe('refresh')
  })

  it('refreshes with the stored refresh token', async () => {
    const { session } = setup()
    await session.setTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' })
    const client = new MobileAuthClient({
      baseUrl: 'https://api.example.com',
      session,
      fetcher: async (_input, init) => {
        expect(init?.body).toBe(JSON.stringify({ refreshToken: 'old-refresh' }))
        return new Response(JSON.stringify({
          statusName: 'OK', message: null, data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
        }))
      },
    })

    await client.refresh()
    expect(session.getAccessToken()).toBe('new-access')
    await expect(session.getRefreshToken()).resolves.toBe('new-refresh')
  })

  it('clears local credentials even if remote sign out fails', async () => {
    const { session } = setup()
    await session.setTokens({ accessToken: 'access', refreshToken: 'refresh' })
    const client = new MobileAuthClient({
      baseUrl: 'https://api.example.com',
      session,
      fetcher: async () => new Response('', { status: 500 }),
    })

    await expect(client.signOut()).rejects.toThrow('로그아웃 요청을 처리하지 못했습니다.')
    expect(session.getAccessToken()).toBeUndefined()
    await expect(session.getRefreshToken()).resolves.toBeNull()
  })
})
