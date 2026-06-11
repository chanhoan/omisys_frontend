import { formatDate } from '@omi/domain'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getEvent } from '../../../lib/server-fetch'

interface EventDetailPageProps { params: Promise<{ eventId: string }> }

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { eventId } = await params
  const event = await getEvent(Number(eventId))
  return { title: event?.title ?? 'Event' }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params
  const event = await getEvent(Number(eventId))
  if (!event) notFound()

  return (
    <section className="section feature-page">
      <div className="feature-image">
        {event.imgUrl ? (
          <Image alt={event.title} fill sizes="(max-width: 900px) 100vw, 55vw" src={event.imgUrl} />
        ) : null}
      </div>
      <div className="feature-copy">
        <p className="eyebrow">EVENT</p>
        <h1>{event.title}</h1>
        {event.startAt && event.endAt ? (
          <p className="event-period">{formatDate(event.startAt)} – {formatDate(event.endAt)}</p>
        ) : null}
        <p>{event.content}</p>
        <Link className="button dark" href="/shop">View collection</Link>
      </div>
    </section>
  )
}
