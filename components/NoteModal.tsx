"use client";

import { getDisplayName, getSeenRelays } from "applesauce-core/helpers";
import { eventStore } from "@/lib/nostr";
import { stripEmojis } from "@/lib/utils";
import { NostrEvent } from "nostr-tools";
import { useObservableMemo } from "applesauce-react/hooks";
import { useEffect, useMemo } from "react";

interface NoteModalProps {
  note: NostrEvent | null;
  onClose: () => void;
}

export default function NoteModal({ note, onClose }: NoteModalProps) {
  const seenRelays = useMemo(() => {
    if (!note) return undefined;
    const relays = getSeenRelays(note);
    console.log("[ProfileLoader] NoteModal - Extracted seen relays:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      seenRelays: relays ? Array.from(relays) : null,
      noteId: note.id.slice(0, 8) + "...",
    });
    return relays;
  }, [note]);

  const profile = useObservableMemo(
    () => {
      if (!note) return undefined;
      const relays = seenRelays && Array.from(seenRelays);
      console.log("[ProfileLoader] NoteModal - Requesting profile:", {
        pubkey: note.pubkey.slice(0, 8) + "...",
        relays: relays || [],
        hasRelays: !!relays && relays.length > 0,
      });
      return eventStore.profile({ pubkey: note.pubkey, relays });
    },
    [note?.pubkey || '', seenRelays?.size]
  );

  const day = useMemo(
    () => note ? new Date(note.created_at * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : '',
    [note]
  );

  const displayName = useMemo(() => {
    if (!note) return '';
    const rawName = getDisplayName(profile, note.pubkey.slice(0, 8) + "...");
    return stripEmojis(rawName);
  }, [profile, note]);

  useEffect(() => {
    if (!note) return;
    console.log("[ProfileLoader] NoteModal - Profile received:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      hasProfile: !!profile,
      profileName: profile?.name || null,
      profileDisplayName: profile?.display_name || null,
    });
  }, [profile, note]);

  useEffect(() => {
    if (!note) return;
    console.log("[ProfileLoader] NoteModal - Display name calculated:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      displayName,
      hasProfile: !!profile,
    });
  }, [displayName, profile, note]);

  if (!note) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className="relative bg-amber-50 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 border border-amber-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="text-xs text-amber-700">
            {day}
          </div>
          <button
            onClick={onClose}
            className="text-amber-600 hover:text-amber-800 transition-colors p-2 hover:bg-amber-100 rounded-full"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-amber-900 leading-relaxed whitespace-pre-wrap break-words mb-4">
            {note.content}
          </p>
          <div className="flex items-center gap-2">
            <span className="signature text-amber-900">{displayName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

