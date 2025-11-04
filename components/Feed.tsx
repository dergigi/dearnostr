"use client";

import { mapEventsToStore, mapEventsToTimeline } from "applesauce-core";
import { onlyEvents } from "applesauce-relay";
import { useObservableMemo } from "applesauce-react/hooks";
import { pool, eventStore } from "@/lib/nostr";
import { DEFAULT_RELAYS, DEAR_NOSTR_PREFIX, DEAR_NOSTR_HASHTAG } from "@/lib/constants";
import { merge, map, startWith, tap } from "rxjs";
import { useEffect } from "react";
import { NostrEvent } from "nostr-tools";
import NoteCard from "./NoteCard";

const DEBUG_PREFIX = "[Feed:Debug]";

export default function Feed() {
  useEffect(() => {
    console.log(`${DEBUG_PREFIX} Component mounted, default relays:`, DEFAULT_RELAYS);
    console.log(`${DEBUG_PREFIX} Relay pool:`, pool);
    console.log(`${DEBUG_PREFIX} Event store:`, eventStore);
  }, []);

  const events = useObservableMemo(() => {
    console.log(`${DEBUG_PREFIX} Creating subscriptions for ${DEFAULT_RELAYS.length} relays`);
    
    // Create subscriptions for each relay
    const subscriptions = DEFAULT_RELAYS.map((relayUrl) => {
      console.log(`${DEBUG_PREFIX} Creating subscription for relay:`, relayUrl);
      const sub = pool.relay(relayUrl).subscription({
        kinds: [1],
        "#t": [DEAR_NOSTR_HASHTAG],
        limit: 100,
      });
      console.log(`${DEBUG_PREFIX} Subscription created for ${relayUrl}:`, sub);
      return sub;
    });

    console.log(`${DEBUG_PREFIX} Total subscriptions created:`, subscriptions.length);

    // Merge all relay subscriptions
    return merge(...subscriptions).pipe(
      tap((response) => {
        if (typeof response === "object" && response !== null && "id" in response) {
          const event = response as NostrEvent;
          console.log(`${DEBUG_PREFIX} Received event from relay:`, event.id, event.kind, event.content?.substring(0, 50));
        } else {
          console.log(`${DEBUG_PREFIX} Received non-event response from relay:`, response);
        }
      }),
      onlyEvents(),
      tap((event) => {
        console.log(`${DEBUG_PREFIX} Event passed onlyEvents filter:`, event?.id);
      }),
      mapEventsToStore(eventStore),
      tap(() => {
        console.log(`${DEBUG_PREFIX} Event added to store`);
      }),
      mapEventsToTimeline(),
      tap((timeline) => {
        console.log(`${DEBUG_PREFIX} Timeline updated, total events:`, timeline.length);
      }),
      map((timeline) => {
        // Filter to only show notes that start with "Dear Nostr"
        const filtered = timeline.filter((event) =>
          event.content.trim().startsWith(DEAR_NOSTR_PREFIX)
        );
        console.log(`${DEBUG_PREFIX} Filtered timeline: ${filtered.length}/${timeline.length} events match "Dear Nostr" prefix`);
        return filtered;
      }),
      map((timeline) => {
        const newArray = [...timeline];
        console.log(`${DEBUG_PREFIX} Created new array reference, length:`, newArray.length);
        return newArray;
      }),
      startWith([]) // Emit empty array initially so loading state resolves
    );
  }, []);

  useEffect(() => {
    console.log(`${DEBUG_PREFIX} Events state changed:`, {
      events: events,
      eventsLength: Array.isArray(events) ? events.length : undefined,
      isUndefined: events === undefined,
      isArray: Array.isArray(events),
    });
  }, [events]);

  const loading = events === undefined;
  
  const eventsLength = Array.isArray(events) ? events.length : 0;
  console.log(`${DEBUG_PREFIX} Render - loading:`, loading, "events:", eventsLength);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm text-gray-500">Loading feed...</div>
        </div>
      </div>
    );
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">No Dear Nostr posts yet.</div>
          <div className="text-sm text-gray-500">Be the first to post!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Dear Nostr Feed</h2>
        <p className="text-sm text-gray-600 mt-1">{events.length} {events.length === 1 ? 'post' : 'posts'}</p>
      </div>
      <div>
        {events.map((event) => (
          <NoteCard key={event.id} note={event} />
        ))}
      </div>
    </div>
  );
}
