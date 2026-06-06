import type { Metadata } from 'next'

import { SignupForm } from '../../components/signup-form'

export const metadata: Metadata = { title: 'Create account' }

export default function SignupPage() {
  return <section className="auth-page section"><div><p className="eyebrow">JOIN OMI</p><h1>Create account</h1><p>주문, 쿠폰, 포인트를 하나의 계정에서 관리합니다.</p></div><SignupForm /></section>
}
