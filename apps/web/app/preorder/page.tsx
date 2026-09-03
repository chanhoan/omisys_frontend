import { formatDate, formatDateTime } from '@omi/domain'
import type { Metadata } from 'next'
import Link from 'next/link'

import { GateCard } from '../../components/gate-card'
import { CalendarIcon, WarningTriangleIcon } from '../../components/icons'
import { PreorderButton } from '../../components/preorder-button'
import { PreorderCountdown } from '../../components/preorder-countdown'
import { Sentences } from '../../components/sentences'
import { StateBlock } from '../../components/state-block'
import { ToastButton } from '../../components/toast-button'
import { getAddresses, getCurrentUser, getPreorders } from '../../lib/server-fetch'

export const metadata: Metadata = { title: '사전예약' }

interface PreorderPageProps { searchParams: Promise<{ gate?: string }> }

const gateSentences = ['사전예약은 회원 계정으로만 신청할 수 있습니다.', '로그인 후 이 페이지로 돌아옵니다.'] as const
const emptySentences = ['새 드롭이 열리면 알려드릴까요?', '알림을 신청하면 오픈 시각에 맞춰 안내합니다.'] as const
const errorSentences = ['일시적인 오류입니다. 잠시 후 다시 시도해주세요.', '문제가 계속되면 고객지원으로 알려주세요.'] as const

function preorderState(value: string): 'open' | 'scheduled' | 'closed' {
  if (value === 'OPEN_FOR_ORDER') return 'open'
  if (value === 'SCHEDULED' || value === 'PENDING') return 'scheduled'
  return 'closed'
}

const STATE_LABEL = { open: '진행 중', scheduled: '오픈 예정', closed: '마감' } as const

export default async function PreorderPage({ searchParams }: PreorderPageProps) {
  const { gate } = await searchParams
  const [page, addresses, user] = await Promise.all([getPreorders(0), getAddresses(), getCurrentUser()])

  if (gate === '1' && user === null) {
    return <section className="listing-page section">
      <div className="listing-title"><div><p className="eyebrow">PRE-ORDER</p><h1>사전예약.</h1></div></div>
      <GateCard
        action={<div className="form-actions" style={{ justifyContent: 'center' }}><Link className="button dark" href="/login?next=/preorder">로그인</Link><Link className="button ghost" href="/signup">회원가입</Link></div>}
        description={<Sentences sentences={gateSentences} />}
        title="로그인이 필요합니다"
      />
    </section>
  }

  if (page === null) {
    return <section className="listing-page section">
      <div className="listing-title"><div><p className="eyebrow">PRE-ORDER</p><h1>사전예약.</h1></div></div>
      <StateBlock
        action={<div className="form-actions" style={{ justifyContent: 'center' }}><Link className="button dark" href="/preorder">다시 시도</Link><Link className="button ghost" href="/support">고객지원</Link></div>}
        description={<Sentences sentences={errorSentences} />}
        icon={<WarningTriangleIcon />}
        title="사전예약을 불러오지 못했습니다"
      />
    </section>
  }

  if (page.content.length === 0) {
    return <section className="listing-page section">
      <div className="listing-title"><div><p className="eyebrow">PRE-ORDER</p><h1>사전예약.</h1></div></div>
      <StateBlock
        action={<ToastButton label="드롭 알림 신청" message="드롭 알림은 준비 중입니다." />}
        description={<Sentences sentences={emptySentences} />}
        icon={<CalendarIcon />}
        title="예정된 사전예약이 없습니다"
      />
    </section>
  }

  const defaultAddressId = addresses?.find((address) => address.isDefault)?.id ?? addresses?.[0]?.id
  const openCount = page.content.filter((preorder) => preorderState(preorder.state) === 'open').length

  return (
    <section className="listing-page section">
      <div className="listing-title"><div><p className="eyebrow">PRE-ORDER</p><h1>사전예약.</h1></div><p>진행 {openCount}건</p></div>
      <ul className="preorder-list">
        {page.content.map((preorder) => {
          const state = preorderState(preorder.state)
          return <li className="preorder-card" key={preorder.preOrderId}>
            <div className="preorder-copy">
              <span className={`preorder-state is-${state}`}>{STATE_LABEL[state]}</span>
              <h2>{preorder.preOrderTitle}</h2>
              <div className="preorder-meta">
                {state === 'scheduled'
                  ? <span>예약 시작 <b>{preorder.startDateTime ? formatDateTime(preorder.startDateTime) : '추후 안내'}</b></span>
                  : <span>예약 종료 <b>{preorder.endDateTime ? formatDateTime(preorder.endDateTime) : '추후 안내'}</b></span>}
                <span>{state === 'closed' ? '출고' : '출고 예정'} <b>{preorder.releaseDateTime ? formatDate(preorder.releaseDateTime) : '추후 안내'}</b></span>
              </div>
              {state === 'scheduled' && preorder.startDateTime ? <PreorderCountdown startAt={preorder.startDateTime} /> : null}
              {state === 'open' && preorder.availableQuantity != null ? (
                <div className="preorder-stock"><p className="app-note">잔여 <b>{preorder.availableQuantity}</b>개</p></div>
              ) : null}
              {state === 'closed' ? <p className="app-note" style={{ marginTop: 12 }}>예약이 마감되었습니다.</p> : null}
            </div>
            <div style={{ display: 'grid', gap: 9, minWidth: 180 }}>
              <PreorderButton addressId={defaultAddressId} authenticated={user !== null} preOrderId={preorder.preOrderId} state={state} />
              <Link className="more-link" href={`/products/${preorder.productId}`} style={{ textAlign: 'center', fontSize: 13 }}>{state === 'closed' ? '일반 판매 보기 ›' : '상세 보기 ›'}</Link>
            </div>
          </li>
        })}
      </ul>
    </section>
  )
}
