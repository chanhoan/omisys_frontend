import { type CSSProperties, type ReactNode } from 'react'

import { AlertIcon, InfoIcon } from './icons'

export type BannerTone = 'info' | 'warn' | 'error'

export interface BannerProps {
  children: ReactNode
  tone?: BannerTone
  icon?: ReactNode
  style?: CSSProperties
}

export function Banner({ children, tone = 'info', icon, style }: BannerProps) {
  return (
    <div className={`banner is-${tone}`} role="status" style={style}>
      {icon ?? (tone === 'info' ? <InfoIcon /> : <AlertIcon />)}
      <span>{children}</span>
    </div>
  )
}
