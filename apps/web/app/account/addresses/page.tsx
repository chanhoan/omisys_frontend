import type { Metadata } from 'next'

import { AddressForm, DeleteAddressButton } from '../../../components/address-form'
import { getAddresses } from '../../../lib/server-fetch'

export const metadata: Metadata = { title: '배송지 관리' }

export default async function AddressesPage() {
  const addresses = await getAddresses()

  return (
    <section className="account-section section">
      <p className="eyebrow">MY OMI · DELIVERY</p>
      <h1>Addresses</h1>
      {addresses && addresses.length > 0 ? (
        <ul className="address-list">
          {addresses.map((addr) => (
            <li className="address-card" key={addr.id}>
              <div className="address-info">
                <strong>{addr.recipient}{addr.alias ? ` · ${addr.alias}` : ''}{addr.isDefault ? ' · 기본' : ''}</strong>
                <span>{addr.phoneNumber}</span>
                <p>({addr.zipcode}) {addr.address}</p>
              </div>
              <div className="address-actions">
                <AddressForm address={addr} />
                <DeleteAddressButton addressId={addr.id} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-note">등록된 배송지가 없습니다.</p>
      )}
      <AddressForm />
    </section>
  )
}
