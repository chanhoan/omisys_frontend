import { type CSSProperties, type ReactNode } from 'react'

export interface GateCardProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  icon?: ReactNode
  style?: CSSProperties
}

export function GateCard({ title, description, action, icon, style }: GateCardProps) {
  return (
    <div className="gate-card" style={style}>
      {icon ? <span className="state-icon">{icon}</span> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  )
}
