"use client";

import { getDisplayName, getSeenRelays } from "applesauce-core/helpers";
import { eventStore } from "@/lib/nostr";
import { stripEmojis } from "@/lib/utils";
import { NostrEvent } from "nostr-tools";
import { useObservableMemo } from "applesauce-react/hooks";
import { useMemo } from "react";

export default function NoteCard({ note }: { note: NostrEvent }) {
  const seenRelays = useMemo(() => {
    return getSeenRelays(note);
  }, [note]);

  const profile = useObservableMemo(
    () => {
      const relays = seenRelays && Array.from(seenRelays);
      return eventStore.profile({ pubkey: note.pubkey, relays });
    },
    [note.pubkey, seenRelays?.size]
  );

  const displayNameRaw = getDisplayName(profile, note.pubkey.slice(0, 8) + "...");
  const displayName = useMemo(() => stripEmojis(displayNameRaw), [displayNameRaw]);

  const timestamp = useMemo(
    () => new Date(note.created_at * 1000).toLocaleString(),
    [note.created_at]
  );

  return (
    <div className="border-b border-gray-100 py-5 px-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800 leading-relaxed break-words whitespace-pre-wrap mb-2">
            {note.content}
          </p>
          <div className="flex items-center gap-2">
            <span className="signature text-sm text-gray-900">{displayName}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
