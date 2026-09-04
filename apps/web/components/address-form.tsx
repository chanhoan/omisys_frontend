'use client'

import type { Address, AddressWrite } from '@omi/api'
import { useRouter } from 'next/navigation'
import { type FormEvent, useRef, useState } from 'react'

import { AddressSearchDialog } from './address-search-dialog'
import { ConfirmDialog } from './confirm-dialog'
import { FormErrorBox } from './form-error-box'
import { Sentences } from './sentences'
import { useToast } from './toast'
import type { DaumPostcodeData } from './use-daum-postcode'

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

// 위젯이 돌려준 도로명/지번 주소에 법정동·건물명 참고항목을 괄호로 덧붙인다.
function formatSelectedAddress(data: DaumPostcodeData): string {
  if (data.userSelectedType !== 'R') return data.jibunAddress
  const extra = [data.bname, data.buildingName].filter(Boolean).join(', ')
  return extra ? `${data.roadAddress} (${extra})` : data.roadAddress
}

export function AddressForm({ address, onCancel, onSaved }: AddressFormProps) {
  const router = useRouter()
  const { show } = useToast()
  const isEdit = address !== undefined
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const initial = splitAddress(address?.address)
  // 별칭 도입 전 행은 alias 가 null 이다. AddressCard 의 표시용 label 과 같은 규칙으로 채워 둔다.
  const [alias, setAlias] = useState(address?.alias ?? address?.recipient ?? '')
  const [zipcode, setZipcode] = useState(address?.zipcode ?? '')
  const [base, setBase] = useState(initial.base)
  const [detail, setDetail] = useState(initial.detail)
  const [searchOpen, setSearchOpen] = useState(false)
  const detailInputRef = useRef<HTMLInputElement>(null)

  function handlePostcodeComplete(data: DaumPostcodeData) {
    setZipcode(data.zonecode)
    setBase(formatSelectedAddress(data))
    setDetail('')
    setError('')
    requestAnimationFrame(() => detailInputRef.current?.focus())
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = event.currentTarget
    const read = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value.trim()
    const trimmedBase = base.trim()
    const trimmedDetail = detail.trim()
    const trimmedAlias = alias.trim()
    // readOnly 입력은 브라우저 required 검증에서 제외되므로 직접 막는다.
    if (!zipcode.trim() || !trimmedBase) {
      setError('주소 검색을 눌러 주소를 선택하세요.')
      return
    }
    // 서버가 alias 에 @NotBlank 를 걸어 두어 비어 있으면 400 으로 떨어진다.
    if (!trimmedAlias) {
      setError('배송지 별칭을 입력하세요.')
      return
    }
    setPending(true)
    const data: AddressWrite = {
      alias: trimmedAlias,
      recipient: read('recipient'),
      phoneNumber: read('phoneNumber'),
      zipcode: zipcode.trim(),
      address: trimmedDetail ? `${trimmedBase}${DETAIL_SEPARATOR}${trimmedDetail}` : trimmedBase,
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
      if (!isEdit) {
        // form.reset() 은 controlled 값을 되돌리지 못하므로 state 도 직접 비운다.
        form.reset()
        setAlias('')
        setZipcode('')
        setBase('')
        setDetail('')
      }
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
        <label>배송지 별칭<input name="alias" onChange={(event) => setAlias(event.target.value)} placeholder="집, 회사" required type="text" value={alias} /></label>
        <label>받는 분<input defaultValue={address?.recipient ?? ''} name="recipient" placeholder="이름" required type="text" /></label>
        <label>연락처<input defaultValue={address?.phoneNumber ?? ''} name="phoneNumber" placeholder="010-0000-0000" required type="tel" /></label>
        <label>우편번호
          <span style={{ display: 'flex', gap: 8 }}>
            <input name="zipcode" placeholder="00000" readOnly required style={{ flex: 1 }} type="text" value={zipcode} />
            <button className="button ghost" onClick={() => setSearchOpen(true)} type="button">주소 검색</button>
          </span>
        </label>
        <label>기본 주소<input name="addressBase" placeholder="주소 검색을 눌러 선택하세요" readOnly required type="text" value={base} /></label>
        <label>상세 주소<input name="addressDetail" onChange={(event) => setDetail(event.target.value)} placeholder="동 · 호수" ref={detailInputRef} type="text" value={detail} /></label>
        <label className="address-default"><input defaultChecked={address?.isDefault ?? false} name="isDefault" type="checkbox" />기본 배송지로 설정</label>
        <div className="form-actions" style={{ margin: 0 }}>
          <button className="button dark" disabled={pending} type="submit">{pending ? '저장 중…' : '저장'}</button>
          {onCancel ? <button className="button ghost" disabled={pending} onClick={onCancel} type="button">취소</button> : null}
        </div>
      </form>
      <AddressSearchDialog onClose={() => setSearchOpen(false)} onComplete={handlePostcodeComplete} open={searchOpen} />
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
          // 별칭 도입 전 행은 alias 가 null 인데 서버가 @NotBlank 를 요구하므로 표시용 label 과 같은 규칙으로 채운다.
          alias: address.alias ?? address.recipient,
          recipient: address.recipient,
          phoneNumber: address.phoneNumber,
          zipcode: address.zipcode,
          address: address.address,
          isDefault: true,
        } satisfies AddressWrite),
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
    // key 로 마운트 경계를 못 박는다 — 폼 상태는 초기값으로만 세팅되므로 다른 주소가 넘어오면 다시 마운트돼야 한다.
    return <li className="address-card"><AddressForm address={address} key={address.id} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} /></li>
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
