"use client";

import { getDisplayName, getSeenRelays } from "applesauce-core/helpers";
import { eventStore } from "@/lib/nostr";
import { stripEmojis } from "@/lib/utils";
import { NostrEvent } from "nostr-tools";
import { useObservableMemo } from "applesauce-react/hooks";
import { useMemo } from "react";

interface FloatingNoteProps {
  note: NostrEvent;
  topPosition: number;
  duration: number;
  delay: number;
  onClick: () => void;
}

export default function FloatingNote({ note, topPosition, duration, delay, onClick }: FloatingNoteProps) {
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

  const displayNameRaw = getDisplayName(profile, note.pubkey.slice(0, 6));
  const displayName = useMemo(() => stripEmojis(displayNameRaw), [displayNameRaw]);

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
        <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap break-words line-clamp-6 mb-2">
          {note.content}
        </p>
        <div className="text-xs text-amber-900 truncate">
          <span className="signature">{displayName}</span>
        </div>
      </div>
    </div>
  );
}

