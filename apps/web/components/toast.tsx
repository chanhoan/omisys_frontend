'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'

interface ToastMessage {
  id: number
  text: string
}

interface ToastContextValue {
  show: (text: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const show = useCallback((text: string) => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div aria-live="polite" className="toast-container">
        {toasts.map((t) => (
          <div className="toast" key={t.id} role="status">{t.text}</div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
