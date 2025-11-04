"use client";

import Feed from "@/components/Feed";

export default function FeedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Feed />
      </div>
    </main>
  );
}

