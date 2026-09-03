import type { Metadata } from 'next'

import { LoginForm } from '../../components/login-form'
import { Sentences } from '../../components/sentences'

export const metadata: Metadata = { title: '로그인' }

interface LoginPageProps { searchParams: Promise<{ next?: string }> }

const sentences = ['주문과 혜택을 한곳에서.', 'GOLD부터는 신규 드롭 선공개.'] as const

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams

  return (
    <section className="auth-page section">
      <div>
        <p className="eyebrow">SIGN IN</p>
        <h1>다시 만나<br />반갑습니다.</h1>
        <p><Sentences sentences={sentences} /></p>
      </div>
      <LoginForm nextPath={next} />
    </section>
  )
}
