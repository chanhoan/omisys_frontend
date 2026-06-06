'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AddressForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const form = e.currentTarget
    const data = {
      recipientName: (form.elements.namedItem('recipientName') as HTMLInputElement).value,
      phoneNumber: (form.elements.namedItem('phoneNumber') as HTMLInputElement).value,
      zipCode: (form.elements.namedItem('zipCode') as HTMLInputElement).value,
      address: (form.elements.namedItem('address') as HTMLInputElement).value,
      addressDetail: (form.elements.namedItem('addressDetail') as HTMLInputElement).value,
    }
    try {
      const res = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? '오류가 발생했습니다.')
      setOpen(false)
      form.reset()
      onDone?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="address-form-wrapper">
      {!open && (
        <button className="button" onClick={() => setOpen(true)} type="button">
          + 배송지 추가
        </button>
      )}
      {open && (
        <form className="address-form" onSubmit={handleSubmit}>
          <h3>새 배송지</h3>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label>
            받는 사람
            <input name="recipientName" required type="text" />
          </label>
          <label>
            연락처
            <input name="phoneNumber" required type="tel" />
          </label>
          <label>
            우편번호
            <input name="zipCode" required type="text" />
          </label>
          <label>
            주소
            <input name="address" required type="text" />
          </label>
          <label>
            상세 주소
            <input name="addressDetail" type="text" />
          </label>
          <div className="form-actions">
            <button className="button dark" disabled={pending} type="submit">
              {pending ? '저장 중…' : '저장'}
            </button>
            <button className="button" onClick={() => setOpen(false)} type="button">취소</button>
          </div>
        </form>
      )}
    </div>
  )
}

export function DeleteAddressButton({ addressId }: { addressId: number }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleDelete() {
    setPending(true)
    await fetch(`/api/address/${addressId}`, { method: 'DELETE' }).catch(() => {})
    setPending(false)
    router.refresh()
  }

  return (
    <button
      className="remove-button"
      disabled={pending}
      onClick={handleDelete}
      type="button"
    >
      {pending ? '…' : '삭제'}
    </button>
  )
}
