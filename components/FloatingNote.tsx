"use client";

import { getDisplayName, getProfilePicture, getSeenRelays } from "applesauce-core/helpers";
import { eventStore } from "@/lib/nostr";
import { NostrEvent } from "nostr-tools";
import { useObservableMemo } from "applesauce-react/hooks";
import Image from "next/image";
import { useMemo } from "react";

interface FloatingNoteProps {
  note: NostrEvent;
  topPosition: number;
  duration: number;
  delay: number;
  onClick: () => void;
}

export default function FloatingNote({ note, topPosition, duration, delay, onClick }: FloatingNoteProps) {
  const seenRelays = useMemo(() => getSeenRelays(note), [note]);
  const profile = useObservableMemo(
    () => eventStore.profile({ pubkey: note.pubkey, relays: seenRelays && Array.from(seenRelays) }),
    [note.pubkey, seenRelays?.size]
  );

  const displayName = getDisplayName(profile, note.pubkey.slice(0, 6));
  const avatarUrl = getProfilePicture(
    profile,
    `https://robohash.org/${note.pubkey}.png`
  );

  // Generate consistent random values based on note ID for stability
  const { rotation, driftY, driftRotate, opacity } = useMemo(() => {
    const seed = note.id.charCodeAt(0) + note.id.charCodeAt(1);
    return {
      rotation: ((seed % 16) - 8) * 0.5, // -4 to +4 degrees
      driftY: (seed % 100) - 50, // -50 to +50 pixels vertical drift
      driftRotate: ((seed % 10) - 5) * 0.3, // -1.5 to +1.5 degrees additional rotation
      opacity: 0.65 + ((seed % 35) / 100), // 0.65 to 1.0
    };
  }, [note.id]);

  return (
    <div
      className="absolute"
      style={{
        top: `${topPosition}%`,
        left: '100%',
        animation: `drift ${duration}ms linear ${delay}ms infinite`,
        opacity: opacity,
        willChange: 'transform',
        '--drift-y': `${driftY}px`,
        '--drift-rotate': `${driftRotate}deg`,
        '--rotation': `${rotation}deg`,
      } as React.CSSProperties & { '--drift-y': string; '--drift-rotate': string; '--rotation': string }}
    >
      <div
        className="bg-amber-50/95 backdrop-blur-sm rounded-lg shadow-md p-4 max-w-xs w-64 border border-amber-200/60 cursor-pointer hover:bg-amber-50 transition-all hover:shadow-lg"
        onClick={onClick}
      >
        <div className="flex items-start gap-3 mb-2">
          <Image
            src={avatarUrl}
            alt={displayName}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-amber-200"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-amber-900 truncate">{displayName}</div>
          </div>
        </div>
        <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap break-words line-clamp-6">
          {note.content}
        </p>
      </div>
    </div>
  );
}

