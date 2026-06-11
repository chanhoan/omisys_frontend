import { formatDate } from '@omi/domain'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { getEvents } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Events' }

export default async function EventsPage() {
  const page = await getEvents(0)
  const events = page?.content ?? []

  if (events.length === 0) {
    return (
      <section className="section simple-page">
        <p className="eyebrow">EVENTS</p>
        <h1>Events</h1>
        <div className="empty-state"><p>진행 중인 이벤트가 없습니다.</p></div>
      </section>
    )
  }

  return (
    <section className="section simple-page">
      <p className="eyebrow">EVENTS</p>
      <h1>Events</h1>
      <ul className="event-list">
        {events.map((event) => (
          <li className="event-card" key={event.id}>
            <Link href={`/events/${event.id}`}>
              <div className="event-image">
                {event.imgUrl ? <Image alt={event.title} fill sizes="(max-width: 900px) 100vw, 45vw" src={event.imgUrl} /> : null}
              </div>
              <div className="event-copy">
                <h2>{event.title}</h2>
                {event.startAt && event.endAt ? (
                  <p className="event-period">{formatDate(event.startAt)} – {formatDate(event.endAt)}</p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
