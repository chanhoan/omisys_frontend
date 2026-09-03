'use client'

import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef } from 'react'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  pending?: boolean
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  pending = false,
  destructive = false,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    cancelButtonRef.current?.focus()

    return () => previousFocusRef.current?.focus()
  }, [open])

  if (!open) return null

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && !pending) onCancel()
    if (event.key !== 'Tab' || pending) return

    if (event.shiftKey && document.activeElement === cancelButtonRef.current) {
      event.preventDefault()
      confirmButtonRef.current?.focus()
    } else if (!event.shiftKey && document.activeElement === confirmButtonRef.current) {
      event.preventDefault()
      cancelButtonRef.current?.focus()
    }
  }

  return (
    <div className="dialog-scrim">
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="dialog"
        onKeyDown={handleKeyDown}
        role="dialog"
      >
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="dialog-actions">
          <button className="button ghost" disabled={pending} onClick={onCancel} ref={cancelButtonRef} type="button">
            {cancelLabel}
          </button>
          <button className={`button${destructive ? ' danger' : ''}`} disabled={pending} onClick={onConfirm} ref={confirmButtonRef} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
