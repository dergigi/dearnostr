"use client";

import { NoteBlueprint } from "applesauce-factory/blueprints";
import { getFactory, publishEvent, eventStore } from "@/lib/nostr";
import { getDisplayName } from "applesauce-core/helpers";
import { useObservableMemo } from "applesauce-react/hooks";
import { stripEmojis } from "@/lib/utils";
import { DEAR_NOSTR_PREFIX, DEAR_NOSTR_HASHTAG } from "@/lib/constants";
import { useState, useRef, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenFancy } from "@fortawesome/free-solid-svg-icons";
import "@/lib/fontawesome";

export default function PostForm({
  pubkey,
  onPostSuccess,
  onThresholdChange,
}: {
  pubkey: string;
  onPostSuccess: () => void;
  onThresholdChange?: (isAbove210: boolean, isAbove420: boolean) => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch profile for logged-in user
  const profile = useObservableMemo(
    () => pubkey ? eventStore.profile({ pubkey }) : undefined,
    [pubkey]
  );

  const displayName = useMemo(() => {
    if (!pubkey) return '';
    const rawName = getDisplayName(profile, pubkey.slice(0, 8) + "...");
    return stripEmojis(rawName);
  }, [profile, pubkey]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const totalLength = DEAR_NOSTR_PREFIX.length + content.length;
  const isAbove210 = totalLength > 210;
  const isAbove420 = totalLength > 420;

  useEffect(() => {
    onThresholdChange?.(isAbove210, isAbove420);
  }, [isAbove210, isAbove420, onThresholdChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Please enter some content");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const factory = getFactory();
      
      // Construct the full content by prepending the prefix to user input
      const fullContent = `${DEAR_NOSTR_PREFIX}${content.trim()}`;
      
      // Create the note event
      const unsignedEvent = await factory.create(NoteBlueprint, fullContent);
      
      // Add the 't' tag for the hashtag (lowercase as per NIP-24)
      const tags = [...unsignedEvent.tags, ["t", DEAR_NOSTR_HASHTAG.toLowerCase()]];
      const eventWithTag = { ...unsignedEvent, tags };
      
      // Sign the event (factory will use the signer if available)
      const signedEvent = await factory.sign(eventWithTag);
      
      // Publish to relays
      await publishEvent(signedEvent);
      
      // Clear input and notify success
      setContent("");
      onPostSuccess();
    } catch (err) {
      console.error("Post error:", err);
      setError("Failed to post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = Math.min(100, (totalLength / 420) * 100);
  const circleColor = isAbove420 
    ? "rgb(220 38 38)" // red-600
    : isAbove210 
    ? "rgb(234 88 12)" // orange-600
    : "rgb(180 83 9)"; // amber-700

  // Calculate circle circumference and stroke-dashoffset for progress
  const circleRadius = 13; // 30px diameter / 2 - 2px stroke = 13px radius
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Calculate opacity: 20% at 60 chars or below, increases to 100% as chars increase
  // Maps from 60 chars (0.2) to 210 chars (1.0)
  const circleOpacity = totalLength <= 60 
    ? 0.2 
    : Math.min(1.0, 0.2 + ((totalLength - 60) / 150) * 0.8);

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div className="mb-4">
        <div className="mb-2 text-amber-900 font-semibold">
          {DEAR_NOSTR_PREFIX}
        </div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-transparent focus:outline-none resize-none disabled:cursor-not-allowed text-amber-900 placeholder-amber-600/70 leading-relaxed"
          rows={8}
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 31px,
              rgba(139, 120, 93, 0.08) 31px,
              rgba(139, 120, 93, 0.08) 32px
            )`,
          }}
        />
      </div>
      
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      
      {displayName && (
        <div className="mb-3 text-left pl-4">
          <span 
            className={`signature text-amber-900 text-2xl ${loading ? 'signature-writing' : 'opacity-20'}`}
          >
            {displayName}
          </span>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !content.trim() || isAbove420}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-amber-100/50 disabled:opacity-40 disabled:cursor-not-allowed text-amber-800 disabled:text-amber-400 font-semibold transition-all duration-200 border-t border-amber-200/50 pt-4 mt-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Signing...</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faPenFancy} className="w-5 h-5" />
            <span>Sign & Send</span>
          </>
        )}
      </button>

      {/* Circular progress indicator */}
      <div 
        className="absolute bottom-0 right-0 w-8 h-8 transition-opacity duration-300"
        style={{ opacity: circleOpacity }}
      >
        {isAbove420 ? (
          // Full circle: filled red circle with white X
          <svg 
            className="w-8 h-8 circle-transform" 
            viewBox="0 0 32 32"
          >
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="rgb(220 38 38)"
              className="circle-fill"
            />
            <path
              d="M10 10 L22 22 M22 10 L10 22"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="circle-x"
              style={{
                strokeDasharray: '20',
              }}
            />
          </svg>
        ) : (
          // Progress circle
          <svg className="w-8 h-8 transform -rotate-90 transition-all duration-300" viewBox="0 0 32 32">
            {/* Background circle */}
            <circle
              cx="16"
              cy="16"
              r={circleRadius}
              fill="none"
              stroke="rgba(139, 120, 93, 0.2)"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <circle
              cx="16"
              cy="16"
              r={circleRadius}
              fill="none"
              stroke={circleColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          </svg>
        )}
      </div>
    </form>
  );
}
