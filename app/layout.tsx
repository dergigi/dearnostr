import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dear Nostr',
  description: 'A clean, minimal Nostr client for Dear Nostr posts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
