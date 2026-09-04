import type { Metadata } from 'next'

import { QueueClient } from '../../components/queue-client'

export const metadata: Metadata = { title: 'Queue' }

export default function QueuePage() {
  return <QueueClient />
}
