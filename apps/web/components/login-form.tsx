'use client'

import { safeNextPath, signInSchema } from '@omi/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(undefined)
    const form = new FormData(event.currentTarget)
    const parsed = signInSchema.safeParse({
      username: form.get('username'),
      password: form.get('password'),
    })
    if (!parsed.success) {
      setError('아이디와 8자 이상의 비밀번호를 확인해주세요.')
      return
    }

    setPending(true)
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const payload = await response.json() as { message?: string }
      if (!response.ok) throw new Error(payload.message || '로그인하지 못했습니다.')
      router.replace(safeNextPath(nextPath))
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '로그인하지 못했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>아이디<input autoComplete="username" name="username" required /></label>
      <label>비밀번호<input autoComplete="current-password" minLength={8} name="password" required type="password" /></label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button dark full" disabled={pending} type="submit">{pending ? 'Signing in…' : 'Sign in'}</button>
      <p className="auth-switch">처음 방문하셨나요? <Link href="/signup">Create account</Link></p>
    </form>
  )
}
