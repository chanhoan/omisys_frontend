import Link from 'next/link'
export default function BenefitsPage() { return <section className="empty-page section"><p className="eyebrow">MY OMI · BENEFITS</p><h1>Benefits</h1><p>쿠폰, 포인트, 회원 등급은 로그인 후 계정별로 조회합니다.</p><Link className="button dark" href="/login?next=/account/benefits">Sign in</Link></section> }
