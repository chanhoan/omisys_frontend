'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ConfirmDialog } from './confirm-dialog'
import { ReviewForm, type ReviewDraft } from './review-form'
import { Sentences } from './sentences'
import { useToast } from './toast'

interface ReviewActionsProps { review: ReviewDraft & { userId: number }; viewerId?: number }

const deleteSentences = ['삭제한 리뷰는 복구할 수 없습니다.', '이 제품에는 다시 리뷰를 작성할 수 있습니다.'] as const

export function ReviewActions({ review, viewerId }: ReviewActionsProps) {
  const router = useRouter()
  const { show } = useToast()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (viewerId === undefined || review.userId !== viewerId) return null

  async function handleDelete() {
    setPending(true)
    setError(null)
    try {
      const response = await fetch(`/api/reviews/${review.reviewId}`, { method: 'DELETE' })
      const payload = await response.json() as { message?: string }
      if (!response.ok) throw new Error(payload.message ?? '리뷰를 삭제하지 못했습니다.')
      show('리뷰를 삭제했습니다.')
      setConfirmingDelete(false)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '리뷰를 삭제하지 못했습니다.')
    } finally { setPending(false) }
  }

  if (editing) return <ReviewForm onDone={() => setEditing(false)} review={review} />

  return (
    <span className="review-actions">
      <button onClick={() => setEditing(true)} type="button">수정</button>
      <button className="is-danger" disabled={pending} onClick={() => setConfirmingDelete(true)} type="button">삭제</button>
      {error ? <span role="alert">{error}</span> : null}
      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel="삭제"
        description={<Sentences sentences={deleteSentences} />}
        destructive
        onCancel={() => { if (!pending) { setConfirmingDelete(false); setError(null) } }}
        onConfirm={handleDelete}
        open={confirmingDelete}
        pending={pending}
        title="리뷰를 삭제할까요?"
      />
    </span>
  )
}
