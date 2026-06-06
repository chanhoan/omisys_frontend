const SAFE_SEGMENT = /^[a-zA-Z0-9._~-]+(?: [a-zA-Z0-9._~-]+)*$/

export function createGatewayPath(segments: readonly string[], query: URLSearchParams): string {
  if (segments.length === 0 || segments[0].toLowerCase() === 'internal') {
    throw new Error('허용되지 않은 API 경로입니다.')
  }

  const encoded = segments.map((segment) => {
    if (segment === '.' || segment === '..' || !SAFE_SEGMENT.test(segment)) {
      throw new Error('허용되지 않은 API 경로입니다.')
    }
    return encodeURIComponent(segment)
  })
  const search = query.toString()
  return `/api/${encoded.join('/')}${search ? `?${search}` : ''}`
}
