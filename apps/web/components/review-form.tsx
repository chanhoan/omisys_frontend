'use client'

import { reviewUpdateSchema } from '@omi/api'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { useToast } from './toast'

export interface ReviewDraft {
  reviewId: number
  rating: number
  content: string
}

// 작성은 productId/orderId 로, 수정은 reviewId 로 한다. 리뷰 목록(ReviewResponse.Summary)에는
// orderId 가 없어서 두 모드가 같은 props 를 쓸 수 없다.
type ReviewFormProps =
  | { productId: string; orderId: number; review?: undefined; onDone?: undefined }
  | { productId?: undefined; orderId?: undefined; review: ReviewDraft; onDone: () => void }

export function ReviewForm(props: ReviewFormProps) {
  const router = useRouter()
  const { show } = useToast()
  const editing = props.review !== undefined
  const [open, setOpen] = useState(editing)
  const [rating, setRating] = useState(props.review?.rating ?? 5)
  const [pending, setPending] = useState(false)

  const failureMessage = editing ? '리뷰를 수정하지 못했습니다.' : '리뷰를 등록하지 못했습니다.'

  function close() {
    setOpen(false)
    props.onDone?.()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = (event.currentTarget.elements.namedItem('content') as HTMLTextAreaElement).value

    // 평점·내용 규칙은 작성과 수정이 같다
    // (ReviewRequest.Create/Update 모두 @Min(1) @Max(5), @NotBlank @Size(max=1000)).
    const parsed = reviewUpdateSchema.safeParse({ rating, content })
    if (!parsed.success) {
      show(parsed.error.issues[0]?.message ?? failureMessage)
      return
    }

    setPending(true)
    try {
      const res = props.review
        ? await fetch(`/api/reviews/${props.review.reviewId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        })
        : await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: props.productId, orderId: props.orderId, ...parsed.data }),
        })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? failureMessage)
      show(editing ? '리뷰가 수정되었습니다.' : '리뷰가 등록되었습니다.')
      close()
      router.refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : failureMessage)
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return <button className="button small" onClick={() => setOpen(true)} type="button">리뷰 작성</button>
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <label>
        평점
        <select onChange={(event) => setRating(Number(event.target.value))} value={rating}>
          {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}점</option>)}
        </select>
      </label>
      <label>
        내용
        <textarea defaultValue={props.review?.content} maxLength={1000} name="content" required rows={3} />
      </label>
      <div className="form-actions">
        <button className="button dark" disabled={pending} type="submit">
          {pending ? (editing ? '수정 중…' : '등록 중…') : (editing ? '수정' : '등록')}
        </button>
        <button className="button" onClick={close} type="button">취소</button>
      </div>
    </form>
  )
}
