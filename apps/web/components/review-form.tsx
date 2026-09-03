'use client'

import { reviewUpdateSchema } from '@omi/api'
import { formatDate } from '@omi/domain'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { FormErrorBox } from './form-error-box'
import { useToast } from './toast'

export interface ReviewDraft { reviewId: number; rating: number; content: string; createdAt?: string }

type ReviewFormProps =
  | { productId: string; orderId: number; productName?: string; orderDate?: string; review?: undefined; onDone?: undefined }
  | { productId?: undefined; orderId?: undefined; productName?: undefined; orderDate?: undefined; review: ReviewDraft; onDone: () => void }

const CONTENT_PLACEHOLDER = '사이즈, 소재, 착용감을 알려주시면 다른 분들께 도움이 됩니다.'

export function ReviewForm(props: ReviewFormProps) {
  const router = useRouter()
  const { show } = useToast()
  const editing = props.review !== undefined
  const [open, setOpen] = useState(editing)
  const [rating, setRating] = useState(props.review?.rating ?? 5)
  const [content, setContent] = useState(props.review?.content ?? '')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const failureMessage = editing ? '리뷰를 수정하지 못했습니다.' : '리뷰를 등록하지 못했습니다.'

  function close() { setError(null); setOpen(false); props.onDone?.() }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = reviewUpdateSchema.safeParse({ rating, content })
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? failureMessage); return }
    setPending(true)
    setError(null)
    try {
      const response = props.review
        ? await fetch(`/api/reviews/${props.review.reviewId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) })
        : await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: props.productId, orderId: props.orderId, ...parsed.data }) })
      const payload = await response.json() as { message?: string }
      if (!response.ok) throw new Error(payload.message ?? failureMessage)
      show(editing ? '리뷰를 수정했습니다.' : '리뷰를 등록했습니다.')
      close()
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : failureMessage)
    } finally { setPending(false) }
  }

  if (!open) return <button className="button ghost small" onClick={() => setOpen(true)} type="button">리뷰 작성</button>

  const subtitle = editing
    ? `${formatDate(props.review?.createdAt)} 작성`
    : [props.productName, props.orderDate ? `${formatDate(props.orderDate)} 주문` : null].filter(Boolean).join(' · ')

  return (
    <form aria-label={editing ? '리뷰 수정' : '리뷰 작성'} className="review-form" onSubmit={handleSubmit}>
      <div className="review-form-head">
        <strong>{editing ? '리뷰 수정' : '리뷰 작성'}</strong>
        {subtitle ? <span className="app-note">{subtitle}</span> : null}
      </div>
      <label>별점
        <span aria-label="별점" className="rating-input" role="radiogroup">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              aria-pressed={rating === value}
              aria-label={`${value}점`}
              className={value <= rating ? 'is-on' : undefined}
              disabled={pending}
              key={value}
              onClick={() => setRating(value)}
              type="button"
            >{'\u2605'}</button>
          ))}
        </span>
      </label>
      <label>내용
        <textarea maxLength={1000} name="content" onChange={(event) => setContent(event.target.value)} placeholder={CONTENT_PLACEHOLDER} required rows={3} value={content} />
      </label>
      <p className="char-count">{content.length.toLocaleString('ko-KR')} / 1,000</p>
      {error ? <FormErrorBox>{error}</FormErrorBox> : null}
      <div className="form-actions" style={{ margin: 0 }}>
        <button className="button dark" disabled={pending} type="submit">{pending ? '저장 중…' : editing ? '저장' : '리뷰 등록'}</button>
        <button className="button ghost" disabled={pending} onClick={close} type="button">취소</button>
      </div>
    </form>
  )
}
