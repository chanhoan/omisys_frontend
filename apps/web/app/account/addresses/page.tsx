import type { Metadata } from 'next'
import Link from 'next/link'

import { AddressCard, AddressForm } from '../../../components/address-form'
import { GateCard } from '../../../components/gate-card'
import { PinIcon } from '../../../components/icons'
import { StateBlock } from '../../../components/state-block'
import { getAddresses, getCurrentUser } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: '배송지 관리' }

export default async function AddressesPage() {
  const [addresses, user] = await Promise.all([getAddresses(), getCurrentUser()])

  if (!user) {
    return (
      <section className="account-section section" style={{ paddingTop: 48 }}>
        <GateCard
          action={<div className="form-actions" style={{ justifyContent: 'center' }}><Link className="button dark" href="/login?next=/account/addresses">로그인</Link><Link className="button ghost" href="/signup">회원가입</Link></div>}
          description="배송지는 로그인 후 계정별로 관리합니다."
          title="로그인이 필요합니다"
        />
      </section>
    )
  }

  const list = addresses ?? []

  return (
    <section className="account-section section">
      <p className="eyebrow">ADDRESSES</p>
      <h1>배송지 관리.</h1>
      {list.length > 0 ? (
        <ul className="address-list">
          {list.map((address) => <AddressCard address={address} key={address.id} />)}
        </ul>
      ) : (
        <StateBlock
          description="배송지를 등록하면 주문할 때 바로 선택할 수 있습니다."
          icon={<PinIcon />}
          title="등록된 배송지가 없습니다"
        />
      )}
      <AddressForm />
    </section>
  )
}
