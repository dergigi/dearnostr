"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center lined-paper">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-900 mb-4">Something went wrong!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

