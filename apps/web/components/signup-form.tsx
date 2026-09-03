'use client'

import { signUpSchema } from '@omi/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { FormErrorBox } from './form-error-box'

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
      // 스키마가 백엔드 @Pattern 을 그대로 옮겨 두었으므로, 그 메시지가 곧 서버가 거부할 이유다.
      setError(parsed.error.issues[0]?.message ?? '입력값을 다시 확인해주세요.')
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
      {error ? <FormErrorBox>{error}</FormErrorBox> : null}
      <label>아이디
        <input autoComplete="username" disabled={pending} maxLength={10} minLength={4} name="username" pattern="[a-z0-9]{4,10}" placeholder="영문 소문자·숫자 4~10자" required />
        <span className="field-hint">로그인에 사용할 아이디입니다. 가입 후에는 변경할 수 없습니다.</span>
      </label>
      <label>이메일
        <input autoComplete="email" disabled={pending} name="email" placeholder="you@example.com" required type="email" />
        <span className="field-hint">주문 확인과 배송 안내를 보낼 주소입니다.</span>
      </label>
      <label>닉네임
        <input autoComplete="nickname" disabled={pending} maxLength={30} name="nickname" placeholder="김민준" required />
      </label>
      <label>비밀번호
        <input autoComplete="new-password" disabled={pending} maxLength={15} minLength={8} name="password" placeholder="8자 이상" required type="password" />
        <span className="field-hint">영문·숫자를 포함해 8자 이상 입력해주세요.</span>
      </label>
      <button className="button dark full" disabled={pending} type="submit">{pending ? '가입 중…' : '가입하기'}</button>
      <p className="auth-switch">이미 계정이 있으신가요? <Link href="/login">로그인</Link></p>
    </form>
  )
}
