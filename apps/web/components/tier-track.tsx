const TIERS = ['SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const

interface TierTrackProps {
  tier: string
  note?: string
}

/** 시안(마이페이지·혜택)의 등급 진척 바. 계약에 누적 구매액이 없어 등급 단계 기준으로 표시한다. */
export function TierTrack({ tier, note }: TierTrackProps) {
  const current = TIERS.indexOf(tier.toUpperCase() as (typeof TIERS)[number])
  const index = current >= 0 ? current : 0
  const next = TIERS[index + 1]
  const progress = ((index + 1) / TIERS.length) * 100

  return (
    <div className="tier-track">
      <div className="tier-track-head">
        <span>현재 등급 <b>{TIERS[index]}</b></span>
        <span className="muted">{next ? `다음 등급 ${next}` : '최고 등급'}</span>
      </div>
      <div className="queue-bar" style={{ maxWidth: 'none', margin: 0 }}><i style={{ width: `${progress}%` }} /></div>
      <div className="tier-steps">
        {TIERS.map((name, position) => <span key={name}>{position === index ? <b>{name}</b> : name}</span>)}
      </div>
      {note ? <p className="app-note" style={{ marginTop: 14 }}>{note}</p> : null}
    </div>
  )
}
