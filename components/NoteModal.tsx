"use client";

import { getDisplayName, getProfilePicture } from "applesauce-core/helpers";
import { eventStore } from "@/lib/nostr";
import { NostrEvent } from "nostr-tools";
import { useObservableMemo } from "applesauce-react/hooks";
import { useMemo } from "react";
import Image from "next/image";

interface NoteModalProps {
  note: NostrEvent | null;
  onClose: () => void;
}

export default function NoteModal({ note, onClose }: NoteModalProps) {
  const profile = useObservableMemo(
    () => note ? eventStore.profile({ pubkey: note.pubkey }) : undefined,
    [note?.pubkey || '']
  );

  const timestamp = useMemo(
    () => note ? new Date(note.created_at * 1000).toLocaleString() : '',
    [note]
  );

  if (!note) return null;

  const displayName = getDisplayName(profile, note.pubkey.slice(0, 8) + "...");
  const avatarUrl = getProfilePicture(
    profile,
    `https://robohash.org/${note.pubkey}.png`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Image
              src={avatarUrl}
              alt={displayName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500">{timestamp}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
            {note.content}
          </p>
        </div>
      </div>
    </div>
  );
}

