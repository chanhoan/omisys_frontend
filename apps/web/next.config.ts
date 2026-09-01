import type { NextConfig } from 'next'

const scriptSrc = process.env.NODE_ENV === 'development'
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'"

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
          value: `default-src 'self'; img-src 'self' https://images.unsplash.com https://s3.amazonaws.com https://*.s3.amazonaws.com https://d3bs7s8t9rgsyg.cloudfront.net data:; style-src 'self' 'unsafe-inline'; ${scriptSrc}; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`,
        },
      ],
    }]
  },
}

export default nextConfig
