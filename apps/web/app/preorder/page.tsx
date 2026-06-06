import { catalogProducts, formatWon } from '@omi/domain'
import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = { title: 'Pre-order' }

export default function PreorderPage() {
  const product = catalogProducts[1]
  return <section className="section feature-page"><div className="feature-image"><Image alt={`${product.productName} 사전예약`} fill sizes="(max-width: 900px) 100vw, 55vw" src={product.originImgUrl} /></div><div className="feature-copy"><p className="eyebrow">PRE-ORDER · UPCOMING</p><h1>{product.productName}</h1><p>{product.description}</p><dl className="product-facts"><div><dt>Release</dt><dd>Backend schedule</dd></div><div><dt>Price</dt><dd>{formatWon(product.discountedPrice)}</dd></div></dl><button className="button dark" disabled type="button">Opening schedule pending</button></div></section>
}
