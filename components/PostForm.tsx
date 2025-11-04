"use client";

import { NoteBlueprint } from "applesauce-factory/blueprints";
import { getFactory, publishEvent } from "@/lib/nostr";
import { DEAR_NOSTR_PREFIX, DEAR_NOSTR_HASHTAG } from "@/lib/constants";
import { useState, useRef, useEffect } from "react";

export default function PostForm({
  onPostSuccess,
}: {
  onPostSuccess: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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

  const totalLength = DEAR_NOSTR_PREFIX.length + content.length;

  return (
    <form onSubmit={handleSubmit} className="w-full">
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
        <div className="mt-2 text-xs text-amber-700/70">
          {totalLength} characters
        </div>
      </div>
      
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !content.trim()}
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Sign</span>
          </>
        )}
      </button>
    </form>
  );
}
