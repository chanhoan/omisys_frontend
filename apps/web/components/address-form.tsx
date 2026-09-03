'use client'

import type { Address } from '@omi/api'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { ConfirmDialog } from './confirm-dialog'
import { FormErrorBox } from './form-error-box'
import { Sentences } from './sentences'
import { useToast } from './toast'

interface AddressFormProps {
  address?: Address
  onCancel?: () => void
  onSaved?: () => void
}

// 계약의 address 는 단일 문자열이라 기본 주소와 상세 주소를 두 칸 공백으로 이어 저장한다.
const DETAIL_SEPARATOR = '  '

function splitAddress(value: string | undefined): { base: string; detail: string } {
  if (!value) return { base: '', detail: '' }
  const marker = value.lastIndexOf(DETAIL_SEPARATOR)
  return marker > 0 ? { base: value.slice(0, marker), detail: value.slice(marker + DETAIL_SEPARATOR.length) } : { base: value, detail: '' }
}

export function AddressForm({ address, onCancel, onSaved }: AddressFormProps) {
  const router = useRouter()
  const { show } = useToast()
  const isEdit = address !== undefined
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const initial = splitAddress(address?.address)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    const form = event.currentTarget
    const read = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value.trim()
    const base = read('addressBase')
    const detail = read('addressDetail')
    const data = {
      recipient: read('recipient'),
      phoneNumber: read('phoneNumber'),
      zipcode: read('zipcode'),
      address: detail ? `${base}${DETAIL_SEPARATOR}${detail}` : base,
      isDefault: (form.elements.namedItem('isDefault') as HTMLInputElement).checked,
    }
    try {
      const res = await fetch(isEdit ? `/api/address/${address.id}` : '/api/address', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const payload = await res.json() as { message?: string }
      if (!res.ok) throw new Error(payload.message ?? '배송지를 저장하지 못했습니다.')
      show(isEdit ? '배송지를 수정했습니다.' : '배송지를 추가했습니다.')
      if (!isEdit) form.reset()
      onSaved?.()
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '배송지를 저장하지 못했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="address-form-wrapper">
      <form className="address-form" onSubmit={handleSubmit}>
        <h3>{isEdit ? '배송지 수정' : '배송지 추가'}</h3>
        {error ? <FormErrorBox>{error}</FormErrorBox> : null}
        <label>받는 분<input defaultValue={address?.recipient ?? ''} name="recipient" placeholder="이름" required type="text" /></label>
        <label>연락처<input defaultValue={address?.phoneNumber ?? ''} name="phoneNumber" placeholder="010-0000-0000" required type="tel" /></label>
        <label>우편번호
          <span style={{ display: 'flex', gap: 8 }}>
            <input defaultValue={address?.zipcode ?? ''} name="zipcode" placeholder="00000" required style={{ flex: 1 }} type="text" />
            <button className="button ghost" onClick={() => show('주소 검색은 준비 중입니다.')} type="button">주소 검색</button>
          </span>
        </label>
        <label>기본 주소<input defaultValue={initial.base} name="addressBase" placeholder="도로명 주소" required type="text" /></label>
        <label>상세 주소<input defaultValue={initial.detail} name="addressDetail" placeholder="동 · 호수" type="text" /></label>
        <label className="address-default"><input defaultChecked={address?.isDefault ?? false} name="isDefault" type="checkbox" />기본 배송지로 설정</label>
        <div className="form-actions" style={{ margin: 0 }}>
          <button className="button dark" disabled={pending} type="submit">{pending ? '저장 중…' : '저장'}</button>
          {onCancel ? <button className="button ghost" disabled={pending} onClick={onCancel} type="button">취소</button> : null}
        </div>
      </form>
    </div>
  )
}

export function AddressCard({ address }: { address: Address }) {
  const router = useRouter()
  const { show } = useToast()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)
  const label = address.alias ?? address.recipient
  const { base, detail } = splitAddress(address.address)

  async function patchDefault() {
    setPending(true)
    try {
      const res = await fetch(`/api/address/${address.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: address.recipient,
          phoneNumber: address.phoneNumber,
          zipcode: address.zipcode,
          address: address.address,
          isDefault: true,
        }),
      })
      if (!res.ok) throw new Error('기본 배송지를 변경하지 못했습니다.')
      show('기본 배송지로 설정했습니다.')
      router.refresh()
    } catch (caught) {
      show(caught instanceof Error ? caught.message : '기본 배송지를 변경하지 못했습니다.')
    } finally { setPending(false) }
  }

  async function handleDelete() {
    setPending(true)
    try {
      const res = await fetch(`/api/address/${address.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('배송지를 삭제하지 못했습니다.')
      show('배송지를 삭제했습니다.')
      setConfirming(false)
      router.refresh()
    } catch (caught) {
      show(caught instanceof Error ? caught.message : '배송지를 삭제하지 못했습니다.')
    } finally { setPending(false) }
  }

  if (editing) {
    return <li className="address-card"><AddressForm address={address} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} /></li>
  }

  return (
    <li className="address-card">
      <div className="address-info">
        <strong>{label} {address.isDefault ? <span className="address-default-tag">기본 배송지</span> : null}</strong>
        <span>{address.phoneNumber}</span>
        <p>({address.zipcode}) {base}{detail ? ` ${detail}` : ''}</p>
      </div>
      <div className="address-actions">
        {address.isDefault ? null : <button className="button ghost small" disabled={pending} onClick={patchDefault} type="button">기본으로</button>}
        <button className="button ghost small" onClick={() => setEditing(true)} type="button">수정</button>
        <button className="button ghost small" disabled={pending} onClick={() => setConfirming(true)} type="button">삭제</button>
      </div>
      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel="삭제"
        description={<Sentences sentences={[`'${label}' 배송지가 목록에서 제거됩니다.`, '이미 진행 중인 주문의 배송지는 변경되지 않습니다.']} />}
        destructive
        onCancel={() => { if (!pending) setConfirming(false) }}
        onConfirm={handleDelete}
        open={confirming}
        pending={pending}
        title="배송지를 삭제할까요?"
      />
    </li>
  )
}
