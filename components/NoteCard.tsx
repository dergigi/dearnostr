"use client";

import { getDisplayName, getProfilePicture } from "applesauce-core/helpers";
import { eventStore } from "@/lib/nostr";
import { NostrEvent } from "nostr-tools";
import { useObservableMemo } from "applesauce-react/hooks";
import { useMemo } from "react";

export default function NoteCard({ note }: { note: NostrEvent }) {
  const profile = useObservableMemo(
    () => eventStore.profile({ pubkey: note.pubkey }),
    [note.pubkey]
  );

  const displayName = getDisplayName(profile, note.pubkey.slice(0, 8) + "...");
  const avatarUrl = getProfilePicture(
    profile,
    `https://robohash.org/${note.pubkey}.png`
  );

  const timestamp = useMemo(
    () => new Date(note.created_at * 1000).toLocaleString(),
    [note.created_at]
  );

  return (
    <div className="border-b border-gray-100 py-5 px-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full ring-2 ring-gray-100"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-gray-900">{displayName}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">{timestamp}</span>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
      </div>
    </div>
  );
}
