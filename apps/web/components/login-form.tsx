'use client'

import { safeNextPath, signInSchema } from '@omi/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { FormErrorBox } from './form-error-box'

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
      if (!response.ok) throw new Error(payload.message || '이메일 또는 비밀번호가 올바르지 않습니다.')
      router.replace(safeNextPath(nextPath))
      router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setPending(false)
    }
  }

  const invalid = error !== undefined || undefined

  return (
    <form className="auth-form" onSubmit={submit}>
      {error ? <FormErrorBox>{error}</FormErrorBox> : null}
      <label>아이디<input aria-invalid={invalid} autoComplete="username" disabled={pending} name="username" placeholder="영문·숫자 4~10자" required /></label>
      <label>비밀번호<input aria-invalid={invalid} autoComplete="current-password" disabled={pending} name="password" placeholder="8자 이상" required type="password" /></label>
      <button className="button dark full" disabled={pending} type="submit">{pending ? '로그인 중…' : '로그인'}</button>
      <p className="auth-switch">계정이 없으신가요? <Link href="/signup">회원가입</Link></p>
    </form>
  )
}
