'use client'

import { useToast } from './toast'

interface ToastButtonProps {
  label: string
  message: string
  className?: string
}

/** 시안에는 있으나 대응 엔드포인트가 계약에 없는 알림 신청류 버튼. 눌린 사실만 알린다. */
export function ToastButton({ label, message, className = 'button dark' }: ToastButtonProps) {
  const { show } = useToast()
  return <button className={className} onClick={() => show(message)} type="button">{label}</button>
}
