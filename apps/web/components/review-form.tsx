'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { useToast } from './toast'

interface ReviewFormProps {
  productId: string
  orderId: number
}

export function ReviewForm({ productId, orderId }: ReviewFormProps) {
  const router = useRouter()
  const { show } = useToast()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const content = (event.currentTarget.elements.namedItem('content') as HTMLTextAreaElement).value
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, orderId, rating, content }),
      })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? '리뷰를 등록하지 못했습니다.')
      show('리뷰가 등록되었습니다.')
      setOpen(false)
      router.refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : '리뷰를 등록하지 못했습니다.')
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
        <textarea maxLength={1000} name="content" required rows={3} />
      </label>
      <div className="form-actions">
        <button className="button dark" disabled={pending} type="submit">{pending ? '등록 중…' : '등록'}</button>
        <button className="button" onClick={() => setOpen(false)} type="button">취소</button>
      </div>
    </form>
  )
}
