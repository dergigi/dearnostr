# Dear Nostr

A clean, minimal Nostr client dedicated to "Dear Nostr" posts.

## Features

- **Extension-based Authentication**: Login using Nostr extensions like Alby or nos2x
- **Auto-formatted Posts**: Automatically prepends "Dear Nostr" and appends `#DearNostr` hashtag
- **Real-time Feed**: Displays all Dear Nostr posts from configured relays
- **Clean UI**: Minimal, modern design with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Applesauce modules (signers, factory, relay, core, react)

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Nostr extension (Alby, nos2x, etc.)
- Access to the applesauce workspace (for local packages)

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Usage

1. Install a Nostr extension (Alby, nos2x, etc.)
2. Open the app and click "Login with Extension"
3. Write your message (it will automatically start with "Dear Nostr")
4. Click "Post" to publish
5. View your post and others in the feed

## Default Relays

- `wss://relay.damus.io`
- `wss://relay.primal.net`

## Project Structure

```
dearnostr/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utilities and Nostr setup
└── package.json      # Dependencies
```

