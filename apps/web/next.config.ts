import type { NextConfig } from 'next'

// 우편번호 위젯 스크립트는 daumcdn 에서 받고, 검색 iframe 은 postcode.map.kakao.com 을 연다.
const POSTCODE_SCRIPT_ORIGIN = 'https://t1.daumcdn.net'
// 위젯 iframe 은 부모 페이지의 프로토콜을 따라간다. dev 는 http 라 스킴을 생략해야 매칭되지만,
// 프로덕션은 https 로 못 박아 평문 프레이밍을 아예 허용하지 않는다.
const POSTCODE_FRAME_HOST = process.env.NODE_ENV === 'development'
  ? 'postcode.map.kakao.com'
  : 'https://postcode.map.kakao.com'

const scriptSrc = process.env.NODE_ENV === 'development'
  ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${POSTCODE_SCRIPT_ORIGIN}`
  : `script-src 'self' 'unsafe-inline' ${POSTCODE_SCRIPT_ORIGIN}`

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@omi/api', '@omi/domain'],
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
      { protocol: 'https', hostname: '**.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'd3bs7s8t9rgsyg.cloudfront.net' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        {
          key: 'Content-Security-Policy',
          value: `default-src 'self'; img-src 'self' https://images.unsplash.com https://s3.amazonaws.com https://*.s3.amazonaws.com https://d3bs7s8t9rgsyg.cloudfront.net data:; style-src 'self' 'unsafe-inline'; ${scriptSrc}; connect-src 'self'; frame-src 'self' ${POSTCODE_FRAME_HOST}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
        },
      ],
    }]
  },
}

export default nextConfig
