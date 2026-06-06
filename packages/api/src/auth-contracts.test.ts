import { describe, expect, it } from 'vitest'

import { signInSchema, signUpSchema, tokenPairSchema } from './auth-contracts'

describe('auth contracts', () => {
  it('normalizes a valid sign-in request', () => {
    expect(signInSchema.parse({ username: '  omi-user ', password: 'password123!' })).toEqual({
      username: 'omi-user',
      password: 'password123!',
    })
  })

  it('rejects short credentials', () => {
    expect(() => signInSchema.parse({ username: 'ab', password: 'short' })).toThrow()
  })

  it('accepts a customer sign-up and fixes the role', () => {
    expect(signUpSchema.parse({
      username: 'omi-user',
      password: 'password123!',
      email: 'user@example.com',
      nickname: '오미',
    }).role).toBe('ROLE_USER')
  })

  it('requires both mobile tokens', () => {
    expect(tokenPairSchema.parse({ accessToken: 'access', refreshToken: 'refresh' })).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
    expect(() => tokenPairSchema.parse({ accessToken: 'access' })).toThrow()
  })
})
