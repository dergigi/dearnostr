"use client";

import { getDisplayName, getSeenRelays } from "applesauce-core/helpers";
import { eventStore } from "@/lib/nostr";
import { NostrEvent } from "nostr-tools";
import { useObservableMemo } from "applesauce-react/hooks";
import { tap } from "rxjs";
import { useEffect, useMemo } from "react";

interface FloatingNoteProps {
  note: NostrEvent;
  topPosition: number;
  duration: number;
  delay: number;
  onClick: () => void;
}

export default function FloatingNote({ note, topPosition, duration, delay, onClick }: FloatingNoteProps) {
  const seenRelays = useMemo(() => {
    const relays = getSeenRelays(note);
    console.log("[ProfileLoader] FloatingNote - Extracted seen relays:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      seenRelays: relays ? Array.from(relays) : null,
      noteId: note.id.slice(0, 8) + "...",
    });
    return relays;
  }, [note]);

  const profile = useObservableMemo(
    () => {
      const relays = seenRelays && Array.from(seenRelays);
      console.log("[ProfileLoader] FloatingNote - Requesting profile:", {
        pubkey: note.pubkey.slice(0, 8) + "...",
        relays: relays || [],
        hasRelays: !!relays && relays.length > 0,
      });
      
      const profileObservable = eventStore.profile({ pubkey: note.pubkey, relays });
      
      // Use shareReplay to log emissions without creating multiple subscriptions
      // This will log the first emission which is important for debugging
      return profileObservable.pipe(
        tap((value: { name?: string; display_name?: string } | undefined) => {
          console.log("[ProfileLoader] FloatingNote - Observable emitted:", {
            pubkey: note.pubkey.slice(0, 8) + "...",
            value: value ? { name: value.name, display_name: value.display_name, hasData: true } : null,
            type: typeof value,
            isUndefined: value === undefined,
            isNull: value === null,
            timestamp: new Date().toISOString(),
          });
        })
      );
    },
    [note.pubkey, seenRelays?.size]
  );

  useEffect(() => {
    console.log("[ProfileLoader] FloatingNote - Profile received:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      hasProfile: !!profile,
      profileName: profile?.name || null,
      profileDisplayName: profile?.display_name || null,
    });
  }, [profile, note.pubkey]);

  const displayName = getDisplayName(profile, note.pubkey.slice(0, 6));
  useEffect(() => {
    console.log("[ProfileLoader] FloatingNote - Display name calculated:", {
      pubkey: note.pubkey.slice(0, 8) + "...",
      displayName,
      hasProfile: !!profile,
    });
  }, [displayName, profile, note.pubkey]);

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

