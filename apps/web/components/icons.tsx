// 시안(.design/designs/*.html)에 등장하는 인라인 SVG 를 그대로 옮긴 아이콘 모음.
// path 데이터와 viewBox 를 시안과 1:1 로 유지한다 — 값을 바꾸면 시안과 어긋난다.

function Icon({ children }: { children: React.ReactNode }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24">{children}</svg>
}

export function SearchIcon() {
  return <Icon><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></Icon>
}

export function HeaderSearchIcon() {
  return (
    <svg aria-hidden="true" className="header-icon" viewBox="0 0 24 24">
      <circle cx="10.75" cy="10.75" r="6.25" />
      <path d="m15.5 15.5 4 4" />
    </svg>
  )
}

export function HeaderBagIcon() {
  return (
    <svg aria-hidden="true" className="header-icon" viewBox="0 0 24 24">
      <path d="M5.5 7.5h13l-1 12h-11z" />
      <path d="M9 7.5V6a3 3 0 0 1 6 0v1.5" />
    </svg>
  )
}

export function BagIcon() {
  return <Icon><path d="M5.5 7.5h13l-1 12h-11z" /><path d="M9 7.5V6a3 3 0 0 1 6 0v1.5" /></Icon>
}

export function WarningTriangleIcon() {
  return <Icon><path d="M12 4l8.5 15h-17z" /><path d="M12 10v4M12 17v.01" /></Icon>
}

export function InfoIcon() {
  return <Icon><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M12 11v5" /></Icon>
}

export function AlertIcon() {
  return <Icon><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16v.01" /></Icon>
}

export function CloseIcon() {
  return <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>
}

export function LockIcon() {
  return <Icon><path d="M6 11V8a6 6 0 0 1 12 0v3" /><rect height="9" rx="2" width="14" x="5" y="11" /></Icon>
}

export function PinIcon() {
  return <Icon><path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" /><circle cx="12" cy="11" r="2" /></Icon>
}

export function CouponIcon() {
  return <Icon><rect height="10" rx="2" width="18" x="3" y="7" /><path d="M9 7v10" /></Icon>
}

export function StarIcon() {
  return <Icon><path d="M12 4.5l2.4 5 5.4.7-4 3.8.9 5.5-4.7-2.5-4.7 2.5.9-5.5-4-3.8 5.4-.7z" /></Icon>
}

export function CheckIcon() {
  return <Icon><path d="M5 12.5 10 17l9-10" /></Icon>
}

export function SoldOutIcon() {
  return <Icon><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></Icon>
}

export function CalendarIcon() {
  return <Icon><rect height="15" rx="2" width="16" x="4" y="5" /><path d="M8 3v4M16 3v4M4 10h16" /></Icon>
}

export function TruckIcon() {
  return <Icon><rect height="9" width="12" x="2.5" y="7" /><path d="M14.5 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></Icon>
}
