import { type CSSProperties, type ReactNode } from 'react'

import { InfoIcon } from './icons'

export interface StateBlockProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  style?: CSSProperties
}

export function StateBlock({ title, description, action, icon, style }: StateBlockProps) {
  return (
    <div className="state-block" style={style}>
      <span className="state-icon">{icon ?? <InfoIcon />}</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  )
}
