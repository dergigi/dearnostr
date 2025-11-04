"use client";

import { mapEventsToStore, mapEventsToTimeline } from "applesauce-core";
import { onlyEvents } from "applesauce-relay";
import { useObservableMemo } from "applesauce-react/hooks";
import { pool, eventStore } from "@/lib/nostr";
import { DEFAULT_RELAYS, DEAR_NOSTR_HASHTAG } from "@/lib/constants";
import { merge, map, startWith, tap } from "rxjs";
import { useEffect, useMemo } from "react";
import { NostrEvent } from "nostr-tools";
import FloatingNote from "./FloatingNote";

const DEBUG_PREFIX = "[Feed:Debug]";

// Animation duration range: 60-120 seconds for very slow, calm movement
const MIN_DURATION = 60000;
const MAX_DURATION = 120000;

export default function Feed() {
  useEffect(() => {
    console.log(`${DEBUG_PREFIX} Component mounted, default relays:`, DEFAULT_RELAYS);
    console.log(`${DEBUG_PREFIX} Relay pool:`, pool);
    console.log(`${DEBUG_PREFIX} Event store:`, eventStore);
  }, []);

  const events = useObservableMemo(() => {
    console.log(`${DEBUG_PREFIX} Creating subscriptions for ${DEFAULT_RELAYS.length} relays`);
    
    const filter = {
      kinds: [1],
      "#t": [DEAR_NOSTR_HASHTAG.toLowerCase()],
      limit: 100,
    };
    
    const subscriptions = DEFAULT_RELAYS.map((relayUrl) => {
      const relay = pool.relay(relayUrl);
      return relay.subscription(filter);
    });

    return merge(...subscriptions).pipe(
      tap((response) => {
        if (typeof response === "object" && response !== null && "id" in response) {
          const event = response as NostrEvent;
          console.log(`${DEBUG_PREFIX} Received event from relay:`, event.id, event.kind, event.content?.substring(0, 50));
        }
      }),
      onlyEvents(),
      mapEventsToStore(eventStore),
      mapEventsToTimeline(),
      map((timeline) => {
        const newArray = [...timeline];
        console.log(`${DEBUG_PREFIX} Created new array reference, length:`, newArray.length);
        return newArray;
      }),
      startWith([])
    );
  }, []);

  const loading = events === undefined;
  const eventsArray = Array.isArray(events) ? events : [];

  // Create a looping array of events for continuous display
  const loopingEvents = useMemo(() => {
    if (eventsArray.length === 0) return [];
    // Duplicate events multiple times to ensure continuous flow
    return [...eventsArray, ...eventsArray, ...eventsArray];
  }, [eventsArray]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500">Loading notes...</div>
        </div>
      </div>
    );
  }

  if (eventsArray.length === 0) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No notes yet.</div>
          <div className="text-sm text-gray-500">The wind is still...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {loopingEvents.map((event, index) => {
        // Random vertical position between 10% and 90% of viewport
        const topPosition = 10 + (index % 8) * 10 + Math.random() * 5;
        // Random duration between MIN and MAX
        const duration = MIN_DURATION + (index % 10) * (MAX_DURATION - MIN_DURATION) / 10;
        // Random delay to stagger the notes
        const delay = (index * 2000) % 10000;
        
        return (
          <FloatingNote
            key={`${event.id}-${index}`}
            note={event}
            topPosition={topPosition}
            duration={duration}
            delay={delay}
          />
        );
      })}
    </div>
  );
}
