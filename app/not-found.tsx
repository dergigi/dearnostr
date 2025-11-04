export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center lined-paper">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-900 mb-4">Not Found</h2>
        <p className="text-amber-700 mb-4">Could not find the requested resource.</p>
        <a
          href="/"
          className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors inline-block"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

