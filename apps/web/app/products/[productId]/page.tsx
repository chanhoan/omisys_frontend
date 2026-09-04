import { formatDate, formatWon, getPurchaseLimit } from '@omi/domain'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AddToCart } from '../../../components/add-to-cart'
import { GateCard } from '../../../components/gate-card'
import { InfoIcon, StarIcon } from '../../../components/icons'
import { RecordProductView } from '../../../components/record-product-view'
import { ReviewActions } from '../../../components/review-actions'
import { ScrollReveal } from '../../../components/scroll-reveal'
import { Sentences } from '../../../components/sentences'
import { StateBlock } from '../../../components/state-block'
import { getCurrentUser, getProduct, getReviews } from '../../../lib/server-fetch'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{ productId: string }>
  searchParams: Promise<{ reviewPage?: string }>
}

const gateSentences = ['이 제품을 주문한 계정만 리뷰를 남길 수 있습니다.', '로그인 후 주문 내역에서 작성해주세요.'] as const

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const { productId } = await params
  const product = await getProduct(productId)
  return { title: product?.productName ?? 'Product' }
}

function stars(rating: number): string {
  const filled = Math.round(rating)
  return '\u2605'.repeat(filled) + '\u2606'.repeat(Math.max(0, 5 - filled))
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { productId } = await params
  const { reviewPage: reviewPageParam } = await searchParams
  const requestedReviewPage = Number(reviewPageParam)
  const reviewPageNum = Number.isInteger(requestedReviewPage) && requestedReviewPage > 0 ? requestedReviewPage : 0
  const [product, reviewPage, user] = await Promise.all([getProduct(productId), getReviews(productId, reviewPageNum), getCurrentUser()])
  if (!product) notFound()

  const reviews = reviewPage?.content ?? []
  const reviewTotal = reviewPage?.totalElements ?? 0
  const stockState = product.soldout || product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'normal'
  // 계약상 limitCountPerUser === 0 은 한도 없음을 뜻한다.
  const purchaseLimit = getPurchaseLimit(product.limitCountPerUser)
  const stockLabel = stockState === 'out'
    ? '품절 · 재입고 미정'
    : stockState === 'low'
      ? `재고 ${product.stock}개 남음 · 곧 품절될 수 있습니다`
      : `재고 ${product.stock}개 · 바로 배송 가능`
  const distribution = [5, 4, 3, 2, 1].map((rating) => reviews.filter((review) => review.rating === rating).length)
  const galleryImages = [...new Set([product.originImgUrl, product.detailImgUrl].filter(Boolean))]
  const reviewPageHref = (next: number) => `/products/${product.productId}?reviewPage=${next}#reviews`
  const reviewTotalPages = reviewPage?.totalPages ?? 0
  const reviewStart = Math.min(Math.max(reviewPageNum - 1, 0), Math.max(reviewTotalPages - 3, 0))
  const reviewPages = Array.from({ length: Math.min(3, reviewTotalPages) }, (_, index) => reviewStart + index)

  return <>
    <RecordProductView productId={product.productId} />
    <div className="pdp">
      <div className="pdp-gallery">
        {galleryImages.map((src, index) => (
          <div className="pdp-image" key={src}>
            <Image alt={`${product.productName} ${index === 0 ? '정면' : '디테일'}`} fill priority={index === 0} sizes="(max-width: 900px) 100vw, 60vw" src={src} />
          </div>
        ))}
      </div>
      <aside className="pdp-info">
        <p className="eyebrow">{product.tags[0] ? `${product.brandName} · ${product.tags[0]}` : product.brandName}</p>
        <h1>{product.productName}</h1>
        <p className="pdp-korean">{product.description}</p>
        <div className="pdp-rating">
          <span aria-hidden="true" className="review-stars">{stars(product.averageRating)}</span>
          <span>{product.averageRating.toFixed(1)}</span>
          <a href="#reviews">리뷰 {product.reviewCount}개</a>
        </div>
        <div className="pdp-price">
          <strong>{formatWon(product.discountedPrice)}</strong>
          {product.discountPercent > 0 ? <><span>{product.discountPercent}%</span><del>{formatWon(product.originalPrice)}</del></> : null}
        </div>
        <p className={stockState === 'normal' ? 'stock-line' : `stock-line is-${stockState}`}><span className="stock-dot" />{stockLabel}</p>
        <dl className="product-facts">
          <div><dt>색상</dt><dd>{product.mainColor}</dd></div>
          <div><dt>사이즈</dt><dd>{product.size}</dd></div>
          {stockState === 'out' ? null : <div><dt>1인 구매 한도</dt><dd>{purchaseLimit === null ? '제한 없음' : `${purchaseLimit}개`}</dd></div>}
          {product.salesCount > 0 ? <div><dt>누적 판매</dt><dd>{product.salesCount}개</dd></div> : null}
        </dl>
        <AddToCart product={product} />
        {stockState === 'out' || purchaseLimit === null ? null : (
          <p className="limit-note">
            <InfoIcon />
            <span>{purchaseLimit === 1
              ? <>1인당 <b>1개</b> 한정 제품입니다.</>
              : <>이 제품은 1인당 최대 <b>{purchaseLimit}개</b>까지 구매할 수 있습니다.</>}</span>
          </p>
        )}
        <div className="pdp-notes">
          <details open><summary>소재 및 관리<span /></summary><p>{product.description}</p></details>
          <details><summary>배송 및 반품<span /></summary><p>{formatWon(50000)} 이상 무료배송. 영업일 기준 2~4일 소요. 미착용 제품은 수령 후 14일 내 반품 가능합니다.</p></details>
          <details><summary>사이즈 가이드<span /></summary><p>표기 사이즈는 {product.size} 기준입니다. 어깨가 넓은 편이면 한 사이즈 업을 권장합니다.</p></details>
        </div>
      </aside>
    </div>

    <ScrollReveal><section className="section pdp-reviews" id="reviews">
      {reviews.length === 0 ? <>
        <div className="section-heading" style={{ marginBottom: 16 }}><div><p className="eyebrow">REVIEWS</p><h2>리뷰.</h2></div></div>
        <StateBlock
          action={<Link className="button ghost" href="/account/orders">주문 내역 보기</Link>}
          description="이 제품을 구매하셨다면 주문 내역에서 리뷰를 남길 수 있습니다."
          icon={<StarIcon />}
          title="첫 리뷰를 기다리고 있습니다"
        />
      </> : <>
        <div className="section-heading"><div><p className="eyebrow">REVIEWS</p><h2>리뷰 {reviewTotal}개.</h2></div></div>
        <div className="review-summary">
          <div className="review-score"><b>{product.averageRating.toFixed(1)}</b><span>/ 5.0</span></div>
          <div className="review-bars">
            {distribution.map((count, index) => (
              <div className="review-bar" key={5 - index}>
                <span>{5 - index}점</span>
                <i><em style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} /></i>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
        {user ? null : <GateCard
          action={<Link className="button dark" href={`/login?next=/products/${product.productId}`}>로그인</Link>}
          description={<Sentences sentences={gateSentences} />}
          style={{ marginTop: 20 }}
          title="리뷰는 구매 후 작성할 수 있습니다"
        />}
        <div className="review-list">
          {reviews.map((review) => {
            const isMine = review.userId === user?.userId
            return (
              <article className="review-item" key={review.reviewId}>
                <div className="review-head">
                  {isMine
                    ? <span><span aria-hidden="true" className="review-stars">{stars(review.rating)}</span> <span className="review-own">내 리뷰</span></span>
                    : <span aria-hidden="true" className="review-stars">{stars(review.rating)}</span>}
                  {isMine
                    ? <ReviewActions review={review} viewerId={user?.userId} />
                    : <span className="review-meta"><span>user_{review.userId}</span><span>{formatDate(review.createdAt)}</span></span>}
                </div>
                {isMine ? <span className="review-meta"><span>{formatDate(review.createdAt)}</span></span> : null}
                <p>{review.content}</p>
              </article>
            )
          })}
        </div>
        {reviewTotalPages > 1 ? <nav aria-label="리뷰 페이지" className="pagination">
          {reviewPageNum > 0 ? <Link href={reviewPageHref(reviewPageNum - 1)}>‹</Link> : <a aria-disabled="true">‹</a>}
          {reviewPages.map((page) => <Link aria-current={page === reviewPageNum ? 'page' : undefined} href={reviewPageHref(page)} key={page}>{page + 1}</Link>)}
          {reviewPageNum < reviewTotalPages - 1 ? <Link href={reviewPageHref(reviewPageNum + 1)}>›</Link> : <a aria-disabled="true">›</a>}
        </nav> : null}
      </>}
    </section></ScrollReveal>
  </>
}
