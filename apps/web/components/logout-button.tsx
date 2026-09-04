'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton({ className = 'button small ghost' }: { className?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' })
    } finally {
      setPending(false)
      router.push('/')
      router.refresh()
    }
  }

  return (
    <button
      className={className}
      disabled={pending}
      onClick={handleLogout}
      type="button"
    >
      {pending ? '로그아웃 중' : '로그아웃'}
    </button>
  )
}
