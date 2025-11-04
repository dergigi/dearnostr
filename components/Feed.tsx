"use client";

import { mapEventsToStore, mapEventsToTimeline } from "applesauce-core";
import { onlyEvents } from "applesauce-relay";
import { useObservableMemo } from "applesauce-react/hooks";
import { pool, eventStore } from "@/lib/nostr";
import { DEFAULT_RELAYS, DEAR_NOSTR_PREFIX, DEAR_NOSTR_HASHTAG } from "@/lib/constants";
import { merge, map, startWith } from "rxjs";
import NoteCard from "./NoteCard";

export default function Feed() {
  const events = useObservableMemo(() => {
    // Create subscriptions for each relay
    const subscriptions = DEFAULT_RELAYS.map((relayUrl) =>
      pool.relay(relayUrl).subscription({
        kinds: [1],
        "#t": [DEAR_NOSTR_HASHTAG],
        limit: 100,
      })
    );

    // Merge all relay subscriptions
    return merge(...subscriptions).pipe(
      onlyEvents(),
      mapEventsToStore(eventStore),
      mapEventsToTimeline(),
      map((timeline) => {
        // Filter to only show notes that start with "Dear Nostr"
        return timeline.filter((event) =>
          event.content.trim().startsWith(DEAR_NOSTR_PREFIX)
        );
      }),
      map((timeline) => [...timeline]), // Create new array reference for React
      startWith([]) // Emit empty array initially so loading state resolves
    );
  }, []);

  const loading = events === undefined;

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

  if (!events || events.length === 0) {
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
