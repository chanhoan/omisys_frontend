export interface SentencesProps {
  sentences: readonly string[]
}

/** 시안은 본문을 문장 단위 블록(.s)으로 쪼개 한 문장이 여러 줄로 갈라지지 않게 한다. */
export function Sentences({ sentences }: SentencesProps) {
  return (
    <>
      {sentences.map((sentence, index) => (
        <span className="s" key={`${index}-${sentence}`}>{sentence}</span>
      ))}
    </>
  )
}

/** 서버에서 온 자유 문장을 .s 블록으로 나눌 때 쓴다. 줄바꿈이 있으면 줄 단위, 없으면 마침표 단위. */
export function splitSentences(text: string): string[] {
  const byLine = text.split(/\r?\n+/).map((line) => line.trim()).filter(Boolean)
  if (byLine.length > 1) return byLine
  return (byLine[0] ?? '').split(/(?<=[.!?。])\s+/).map((part) => part.trim()).filter(Boolean)
}
