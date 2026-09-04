import type { Metadata } from 'next'

import { Sentences } from '../../components/sentences'
import { SignupForm } from '../../components/signup-form'

export const metadata: Metadata = { title: '회원가입' }

const sentences = ['가입 즉시 15% 쿠폰.', '구매할수록 적립률이 오릅니다.'] as const

export default function SignupPage() {
  return (
    <section className="auth-page section">
      <div>
        <p className="eyebrow">SIGN UP</p>
        <h1>OMI를<br />시작하세요.</h1>
        <p><Sentences sentences={sentences} /></p>
      </div>
      <SignupForm />
    </section>
  )
}
