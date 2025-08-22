import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import Providers from './providers'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import './globals.css'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: 'Amin Yosoh - Product Designer Portfolio',
  description: 'Product Designer with 8+ years of experience in UX/UI design, UX research, and user-centered design. Currently working at Axis Communications.',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={outfit.className}>
        <Providers>
          {children}
          <PerformanceMonitor />
        </Providers>
      </body>
    </html>
  )
}
