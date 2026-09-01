'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ReviewForm, type ReviewDraft } from './review-form'
import { useToast } from './toast'

interface ReviewActionsProps {
  review: ReviewDraft & { userId: number }
  /** 로그인하지 않았으면 undefined. */
  viewerId?: number
}

/**
 * 본인 리뷰에만 수정·삭제를 보여준다.
 *
 * 이 가림은 편의이지 보안 경계가 아니다. 남의 reviewId 로 요청을 보내면 백엔드가 거부한다
 * (ReviewService.updateReview/deleteReview -> review.validateOwner(userId)).
 */
export function ReviewActions({ review, viewerId }: ReviewActionsProps) {
  const router = useRouter()
  const { show } = useToast()
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)

  if (viewerId === undefined || review.userId !== viewerId) return null

  async function handleDelete() {
    if (!window.confirm('리뷰를 삭제할까요?')) return

    setPending(true)
    try {
      const res = await fetch(`/api/reviews/${review.reviewId}`, { method: 'DELETE' })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? '리뷰를 삭제하지 못했습니다.')
      show('리뷰가 삭제되었습니다.')
      router.refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : '리뷰를 삭제하지 못했습니다.')
    } finally {
      setPending(false)
    }
  }

  if (editing) {
    return (
      <ReviewForm
        onDone={() => setEditing(false)}
        review={{ reviewId: review.reviewId, rating: review.rating, content: review.content }}
      />
    )
  }

  return (
    <div className="review-actions">
      <button className="button small" onClick={() => setEditing(true)} type="button">수정</button>
      <button className="remove-button" disabled={pending} onClick={handleDelete} type="button">
        {pending ? '삭제 중…' : '삭제'}
      </button>
    </div>
  )
}
