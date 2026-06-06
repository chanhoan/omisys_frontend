'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="empty-page section">
      <p className="eyebrow">ERROR</p>
      <h1>오류가 발생했습니다</h1>
      <p>잠시 후 다시 시도해 주세요.</p>
      <button className="button dark" onClick={reset} type="button">다시 시도</button>
    </section>
  )
}
