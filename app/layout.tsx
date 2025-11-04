import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dear Nostr',
  description: 'A clean, minimal Nostr client for #DearNostr posts',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Dear Nostr',
    description: 'A clean, minimal Nostr client for #DearNostr posts',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dear Nostr',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dear Nostr',
    description: 'A clean, minimal Nostr client for #DearNostr posts',
    images: ['/og-image.png'],
  },
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
