import { formatDateTime } from '@omi/domain'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Sentences, splitSentences } from '../../../components/sentences'
import { getEvent } from '../../../lib/server-fetch'

interface EventDetailPageProps { params: Promise<{ eventId: string }> }

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { eventId } = await params
  const event = await getEvent(Number(eventId))
  return { title: event?.title ?? 'Event' }
}

function isLive(startAt: string | null | undefined, endAt: string | null | undefined, now = new Date()): boolean {
  const start = startAt ? new Date(startAt) : null
  const end = endAt ? new Date(endAt) : null
  if (start && !Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) return false
  if (end && !Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) return false
  return true
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params
  const event = await getEvent(Number(eventId))
  if (!event) notFound()
  const live = isLive(event.startAt, event.endAt)

  return (
    <section className="feature-page section">
      <div className="feature-image">
        {event.imgUrl ? <Image alt={event.title} fill sizes="(max-width: 900px) 100vw, 55vw" src={event.imgUrl} /> : null}
      </div>
      <div className="feature-copy">
        <p className="eyebrow">EVENT · {live ? '진행 중' : '종료'}</p>
        <h1>{event.title}</h1>
        <p><Sentences sentences={splitSentences(event.content)} /></p>
        {event.startAt || event.endAt ? (
          <p className="event-period" style={{ marginBottom: 24 }}>
            {event.startAt ? formatDateTime(event.startAt) : ''}{event.startAt && event.endAt ? ' – ' : ''}{event.endAt ? formatDateTime(event.endAt) : ''}
          </p>
        ) : null}
        <div className="form-actions" style={{ marginTop: 0 }}>
          <Link className="button dark" href="/shop">스토어 보기</Link>
          <Link className="button ghost" href="/account/benefits">쿠폰 확인</Link>
        </div>
      </div>
    </section>
  )
}
