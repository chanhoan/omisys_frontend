import type { Metadata } from 'next'

import { CartProvider } from '../components/cart-provider'
import { SiteFooter } from '../components/site-footer'
import { SiteHeader } from '../components/site-header'
import { ToastProvider } from '../components/toast'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'OMI', template: '%s | OMI' },
  description: 'Quiet forms for everyday movement. OMI official store.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <CartProvider>
          <ToastProvider>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  )
}
