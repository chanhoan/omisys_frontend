import { type CSSProperties, type ReactNode } from 'react'

import { AlertIcon } from './icons'

export interface FormErrorBoxProps {
  children: ReactNode
  style?: CSSProperties
}

export function FormErrorBox({ children, style }: FormErrorBoxProps) {
  return (
    <div className="form-error-box" role="alert" style={style}>
      <AlertIcon />
      <span>{children}</span>
    </div>
  )
}
