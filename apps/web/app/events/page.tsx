import { formatDate } from '@omi/domain'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { CalendarIcon } from '../../components/icons'
import { StateBlock } from '../../components/state-block'
import { getEvents } from '../../lib/server-fetch'

export const metadata: Metadata = { title: 'Events' }

function isLive(startAt: string | null | undefined, endAt: string | null | undefined, now = new Date()): boolean {
  const start = startAt ? new Date(startAt) : null
  const end = endAt ? new Date(endAt) : null
  if (start && !Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) return false
  if (end && !Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) return false
  return true
}

function periodLabel(startAt: string | null | undefined, endAt: string | null | undefined, live: boolean): string {
  const start = startAt ? formatDate(startAt) : null
  const end = endAt ? formatDate(endAt) : '상시'
  const range = start ? `${start} – ${end}` : end
  return live ? range : `종료 · ${range}`
}

export default async function EventsPage() {
  const page = await getEvents(0)
  const events = page?.content ?? []

  if (events.length === 0) {
    return (
      <section className="listing-page section">
        <div className="listing-title"><div><p className="eyebrow">EVENTS</p><h1>이벤트.</h1></div></div>
        <StateBlock
          action={<Link className="button dark" href="/shop">스토어 보기</Link>}
          description="새 이벤트가 열리면 이곳에 표시됩니다."
          icon={<CalendarIcon />}
          title="진행 중인 이벤트가 없습니다"
        />
      </section>
    )
  }

  const liveCount = events.filter((event) => isLive(event.startAt, event.endAt)).length
  const endedCount = events.length - liveCount

  return (
    <section className="listing-page section">
      <div className="listing-title">
        <div><p className="eyebrow">EVENTS</p><h1>이벤트.</h1></div>
        <p>{endedCount > 0 ? `진행 ${liveCount}건 · 종료 ${endedCount}건` : `진행 ${liveCount}건`}</p>
      </div>
      <ul className="event-list">
        {events.map((event) => {
          const live = isLive(event.startAt, event.endAt)
          return (
            <li className="event-card" key={event.id}>
              <Link href={`/events/${event.id}`}>
                <span className="event-image">
                  {event.imgUrl ? <Image alt={event.title} fill sizes="(max-width: 900px) 100vw, 45vw" src={event.imgUrl} /> : null}
                </span>
                <span className="event-copy">
                  {live ? <span className="event-live">진행 중</span> : null}
                  <h2>{event.title}</h2>
                  <p className="event-period">{periodLabel(event.startAt, event.endAt, live)}</p>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
