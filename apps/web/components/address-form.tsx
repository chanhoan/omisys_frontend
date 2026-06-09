'use client'

import type { Address } from '@omi/api'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export function AddressForm({ address, onDone }: { address?: Address; onDone?: () => void }) {
  const router = useRouter()
  const isEdit = address !== undefined
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const form = e.currentTarget
    const data = {
      alias: (form.elements.namedItem('alias') as HTMLInputElement).value,
      recipient: (form.elements.namedItem('recipient') as HTMLInputElement).value,
      phoneNumber: (form.elements.namedItem('phoneNumber') as HTMLInputElement).value,
      zipcode: (form.elements.namedItem('zipcode') as HTMLInputElement).value,
      address: (form.elements.namedItem('address') as HTMLInputElement).value,
      isDefault: (form.elements.namedItem('isDefault') as HTMLInputElement).checked,
    }
    try {
      const res = await fetch(isEdit ? `/api/address/${address.id}` : '/api/address', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? '오류가 발생했습니다.')
      setOpen(false)
      if (!isEdit) form.reset()
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
        <button className={isEdit ? 'remove-button' : 'button'} onClick={() => setOpen(true)} type="button">
          {isEdit ? '수정' : '+ 배송지 추가'}
        </button>
      )}
      {open && (
        <form className="address-form" onSubmit={handleSubmit}>
          <h3>{isEdit ? '배송지 수정' : '새 배송지'}</h3>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label>
            배송지 이름
            <input defaultValue={address?.alias ?? ''} name="alias" placeholder="집, 회사" required type="text" />
          </label>
          <label>
            받는 사람
            <input defaultValue={address?.recipient} name="recipient" required type="text" />
          </label>
          <label>
            연락처
            <input defaultValue={address?.phoneNumber} name="phoneNumber" required type="tel" />
          </label>
          <label>
            우편번호
            <input defaultValue={address?.zipcode} name="zipcode" required type="text" />
          </label>
          <label>
            주소
            <input defaultValue={address?.address} name="address" required type="text" />
          </label>
          <label className="address-default">
            <input defaultChecked={address?.isDefault ?? false} name="isDefault" type="checkbox" />
            기본 배송지로 설정
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
