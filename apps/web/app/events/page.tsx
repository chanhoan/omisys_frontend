import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Events' }

export default function EventsPage() {
  return <section className="section feature-page"><div className="feature-image"><Image alt="OMI Night Shift event" fill sizes="(max-width: 900px) 100vw, 55vw" src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85" /></div><div className="feature-copy"><p className="eyebrow">CURRENT EVENT · 01</p><h1>Night Shift</h1><p>Drop 04의 소재와 실루엣을 편집한 시즌 이벤트입니다. 공개 이벤트 API가 연결되면 기간과 쿠폰 발급 상태를 실시간으로 표시합니다.</p><Link className="button dark" href="/shop">View collection</Link></div></section>
}
