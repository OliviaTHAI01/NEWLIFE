import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NEW LIFE - Roleplay Community',
  description: 'NEW LIFE Roleplay Community',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
