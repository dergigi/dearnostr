"use client";

import { ApplesauceProvider } from "applesauce-react";
import { eventStore, pool } from "@/lib/nostr";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApplesauceProvider eventStore={eventStore} pool={pool}>
      {children}
    </ApplesauceProvider>
  );
}
