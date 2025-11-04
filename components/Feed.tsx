"use client";

import { mapEventsToStore, mapEventsToTimeline } from "applesauce-core";
import { onlyEvents } from "applesauce-relay";
import { useObservableMemo } from "applesauce-react/hooks";
import { pool, eventStore } from "@/lib/nostr";
import { DEFAULT_RELAYS, DEAR_NOSTR_HASHTAG } from "@/lib/constants";
import { merge, map, startWith, tap } from "rxjs";
import { useEffect, useMemo, useState } from "react";
import { NostrEvent } from "nostr-tools";
import FloatingNote from "./FloatingNote";

const DEBUG_PREFIX = "[Feed:Debug]";

// Animation duration range: 20-50 seconds for calm but varied movement
const MIN_DURATION = 20000;
const MAX_DURATION = 50000;

// Minimum vertical spacing between notes to prevent overlap
const MIN_VERTICAL_SPACING = 250; // pixels

export default function Feed() {
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    console.log(`${DEBUG_PREFIX} Component mounted, default relays:`, DEFAULT_RELAYS);
    console.log(`${DEBUG_PREFIX} Relay pool:`, pool);
    console.log(`${DEBUG_PREFIX} Event store:`, eventStore);
    
    // Set initial viewport height
    setViewportHeight(window.innerHeight);
    
    // Update on resize
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // Create a looping array of events with calculated positions to prevent overlap
  const loopingEvents = useMemo(() => {
    if (eventsArray.length === 0) return [];
    // Duplicate events multiple times to ensure continuous flow
    const events = [...eventsArray, ...eventsArray, ...eventsArray];
    
    // Calculate viewport height in pixels
    const usableHeight = viewportHeight * 0.8; // Use 80% of viewport (10% top, 10% bottom)
    const maxLanes = Math.max(2, Math.floor(usableHeight / MIN_VERTICAL_SPACING));
    
    // Assign each note to a lane and calculate positions
    return events.map((event, index) => {
      // Assign to lane with some variation
      const lane = index % maxLanes;
      const laneVariation = (event.id.charCodeAt(0) % 30) - 15; // -15 to +15px variation
      const topPosition = 10 + (lane * (usableHeight / maxLanes)) / viewportHeight * 100 + laneVariation / viewportHeight * 100;
      
      // More varied speed distribution using multiple factors
      const speedSeed = event.id.charCodeAt(0) + event.id.charCodeAt(1) + index;
      const speedVariation = (speedSeed % 100) / 100; // 0 to 1
      // Use exponential distribution for more variation (some very fast, some slower)
      const speedFactor = Math.pow(speedVariation, 0.7); // Skewed toward faster speeds
      const duration = MIN_DURATION + (1 - speedFactor) * (MAX_DURATION - MIN_DURATION);
      
      // Stagger delays more to prevent clustering
      const delay = (index * (duration / 10)) % (duration * 2);
      
      return {
        event,
        topPosition: Math.max(5, Math.min(95, topPosition)), // Clamp between 5% and 95%
        duration,
        delay,
      };
    });
  }, [eventsArray, viewportHeight]);

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
      {loopingEvents.map((noteData, index) => (
        <FloatingNote
          key={`${noteData.event.id}-${index}`}
          note={noteData.event}
          topPosition={noteData.topPosition}
          duration={noteData.duration}
          delay={noteData.delay}
        />
      ))}
    </div>
  );
}
