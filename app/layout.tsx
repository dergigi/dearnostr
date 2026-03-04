"use client";

import { ApplesauceProvider } from "applesauce-react";
import { eventStore, pool } from "@/lib/nostr";
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ApplesauceProvider eventStore={eventStore} pool={pool}>
          {children}
        </ApplesauceProvider>
      </body>
    </html>
  )
}
