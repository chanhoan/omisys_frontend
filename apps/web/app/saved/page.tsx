import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Saved' }

export default function SavedPage() {
  return <section className="empty-page section"><p className="eyebrow">YOUR EDIT</p><h1>Saved</h1><p>마음에 둔 상품을 한곳에서 다시 볼 수 있습니다.</p><Link className="button dark" href="/shop">Explore shop</Link></section>
}
