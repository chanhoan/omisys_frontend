import type { Metadata } from 'next'

import { LoginForm } from '../../components/login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <section className="auth-page section"><div><p className="eyebrow">MY OMI</p><h1>Sign in</h1><p>주문과 배송, 저장한 상품을 이어서 확인하세요.</p></div><LoginForm nextPath={next} /></section>
}
