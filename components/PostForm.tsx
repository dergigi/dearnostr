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
          className="w-full px-4 py-3 border border-amber-300 bg-amber-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none disabled:bg-amber-100/50 disabled:cursor-not-allowed text-amber-900 placeholder-amber-600"
          rows={4}
        />
        <div className="mt-2 text-xs text-amber-700">
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
        className="w-full px-6 py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 disabled:cursor-not-allowed text-amber-50 rounded-lg font-semibold shadow-sm hover:shadow transition-all duration-200"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
