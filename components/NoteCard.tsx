"use client";

import { getDisplayName, getSeenRelays } from "applesauce-core/helpers";
import { eventStore } from "@/lib/nostr";
import { NostrEvent } from "nostr-tools";
import { useObservableMemo } from "applesauce-react/hooks";
import { useEffect, useMemo } from "react";

export default function NoteCard({ note }: { note: NostrEvent }) {
  const seenRelays = useMemo(() => {
    const relays = getSeenRelays(note);
    console.log("[ProfileLoader] NoteCard - Extracted seen relays:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      seenRelays: relays ? Array.from(relays) : null,
      noteId: note.id.slice(0, 8) + "...",
    });
    return relays;
  }, [note]);

  const profile = useObservableMemo(
    () => {
      const relays = seenRelays && Array.from(seenRelays);
      console.log("[ProfileLoader] NoteCard - Requesting profile:", {
        pubkey: note.pubkey.slice(0, 8) + "...",
        relays: relays || [],
        hasRelays: !!relays && relays.length > 0,
      });
      return eventStore.profile({ pubkey: note.pubkey, relays });
    },
    [note.pubkey, seenRelays?.size]
  );

  useEffect(() => {
    console.log("[ProfileLoader] NoteCard - Profile received:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      hasProfile: !!profile,
      profileName: profile?.name || null,
      profileDisplayName: profile?.display_name || null,
    });
  }, [profile, note.pubkey]);

  const displayName = getDisplayName(profile, note.pubkey.slice(0, 8) + "...");
  useEffect(() => {
    console.log("[ProfileLoader] NoteCard - Display name calculated:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      displayName,
      hasProfile: !!profile,
    });
  }, [displayName, profile, note.pubkey]);

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
            <span className="font-semibold text-sm text-gray-900">{displayName}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
