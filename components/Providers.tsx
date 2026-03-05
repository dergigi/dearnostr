"use client";

import { EventStoreProvider } from "applesauce-react/providers";
import { eventStore } from "@/lib/nostr";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <EventStoreProvider eventStore={eventStore}>
      {children}
    </EventStoreProvider>
  );
}
