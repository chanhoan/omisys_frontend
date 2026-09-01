import { describe, expect, it } from 'vitest'

import { signInSchema, signUpSchema, tokenPairSchema } from './auth-contracts'

describe('auth contracts', () => {
  it('normalizes a valid sign-in request', () => {
    expect(signInSchema.parse({ username: '  omiuser ', password: 'password123!' })).toEqual({
      username: 'omiuser',
      password: 'password123!',
    })
  })

  // AuthRequest.SignIn 은 @NotBlank 뿐이다. 가입 규칙을 로그인에 걸면 시드 관리자처럼
  // 규칙 밖 자격증명을 가진 계정이 웹으로 들어올 수 없게 된다.
  it('rejects blank sign-in credentials but not unusual ones', () => {
    expect(() => signInSchema.parse({ username: '   ', password: 'x' })).toThrow()
    expect(() => signInSchema.parse({ username: 'admin', password: '' })).toThrow()
    expect(signInSchema.parse({ username: 'admin', password: 'a' }).username).toBe('admin')
  })

  it('accepts a customer sign-up without inventing a role field', () => {
    const parsed = signUpSchema.parse({
      username: 'omiuser',
      password: 'password123!',
      email: 'user@example.com',
      nickname: '오미',
    })

    expect(Object.keys(parsed).sort()).toEqual(['email', 'nickname', 'password', 'username'])
  })

  it('mirrors the backend username pattern on sign-up', () => {
    const valid = { password: 'password123!', email: 'user@example.com', nickname: '오미' }

    expect(() => signUpSchema.parse({ ...valid, username: 'omi-user' })).toThrow()
    expect(() => signUpSchema.parse({ ...valid, username: 'omi' })).toThrow()
    expect(() => signUpSchema.parse({ ...valid, username: 'omiuser1234' })).toThrow()
    expect(() => signUpSchema.parse({ ...valid, username: 'OmiUser' })).toThrow()
    expect(signUpSchema.parse({ ...valid, username: 'omiuser' }).username).toBe('omiuser')
  })

  it('mirrors the backend password pattern on sign-up', () => {
    const valid = { username: 'omiuser', email: 'user@example.com', nickname: '오미' }

    expect(() => signUpSchema.parse({ ...valid, password: 'short12' })).toThrow()
    expect(() => signUpSchema.parse({ ...valid, password: 'sixteencharacter' })).toThrow()
    expect(() => signUpSchema.parse({ ...valid, password: '비밀번호12345' })).toThrow()
    expect(signUpSchema.parse({ ...valid, password: 'pass_#$%^!-12' }).password).toBe('pass_#$%^!-12')
  })

  it('requires both mobile tokens', () => {
    expect(tokenPairSchema.parse({ accessToken: 'access', refreshToken: 'refresh' })).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    })
    expect(() => tokenPairSchema.parse({ accessToken: 'access' })).toThrow()
  })
})
