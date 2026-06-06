'use client'

import { signUpSchema } from '@omi/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    const form = new FormData(event.currentTarget)
    const parsed = signUpSchema.safeParse({
      username: form.get('username'),
      password: form.get('password'),
      email: form.get('email'),
      nickname: form.get('nickname'),
    })
    if (!parsed.success) {
      setError('입력값을 다시 확인해주세요. 비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setPending(true)
    try {
      const response = await fetch('/api/users/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const payload = await response.json() as { message?: string }
      if (!response.ok) throw new Error(payload.message || '가입하지 못했습니다.')
      router.replace('/login')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '가입하지 못했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>아이디<input autoComplete="username" name="username" required /></label>
      <label>이메일<input autoComplete="email" name="email" required type="email" /></label>
      <label>닉네임<input autoComplete="nickname" name="nickname" required /></label>
      <label>비밀번호<input autoComplete="new-password" minLength={8} name="password" required type="password" /></label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button dark full" disabled={pending} type="submit">{pending ? 'Creating…' : 'Create account'}</button>
      <p className="auth-switch">이미 계정이 있나요? <Link href="/login">Sign in</Link></p>
    </form>
  )
}
