/**
 * A deliberately ephemeral deferred request. Queue admission is per browser
 * session, but the request itself must not survive a reload or be exposed in
 * a URL/storage mechanism. The module lifetime gives us that boundary.
 */
export interface QueueIntent {
  readonly method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly url: string
  readonly body?: string
  readonly contentType?: string
  readonly idempotencyKey: string
}

let queuedIntent: QueueIntent | null = null

function assertSafeIntent(intent: QueueIntent): void {
  if (!intent.url.startsWith('/api/')) throw new Error('Queue intent must target an internal API route.')
  if (!intent.idempotencyKey.trim()) throw new Error('Queue intent requires an idempotency key.')
}

/** Stores a copy so callers cannot change a pending intent after admission. */
export function rememberQueueIntent(intent: QueueIntent): void {
  assertSafeIntent(intent)
  queuedIntent = { ...intent }
}

export function getQueuedIntent(): QueueIntent | null {
  return queuedIntent ? { ...queuedIntent } : null
}

/**
 * Claims and clears the intent before the downstream fetch begins. This makes
 * an accidental second READY poll unable to submit the mutation twice.
 */
export function claimQueuedIntent(): QueueIntent | null {
  const intent = getQueuedIntent()
  queuedIntent = null
  return intent
}

export function clearQueuedIntent(): void {
  queuedIntent = null
}
