import { EventStore } from "applesauce-core";
import { EventFactory } from "applesauce-factory";
import { createAddressLoader } from "applesauce-loaders/loaders";
import { RelayPool } from "applesauce-relay";
import { ExtensionSigner, ISigner } from "applesauce-signers";
import { tap, finalize } from "rxjs";
import { DEFAULT_RELAYS } from "./constants";

// Create singleton instances
export const pool = new RelayPool();
export const eventStore = new EventStore();

// Create address loader for automatically fetching profiles and other replaceable events
const addressLoader = createAddressLoader(pool, {
  eventStore,
  lookupRelays: DEFAULT_RELAYS,
});

// Wrap the loader to add debug logging
const originalLoader = addressLoader;
const debugLoader = (pointer: any) => {
  const pubkeyStr = pointer.pubkey?.slice(0, 8) + "..." || "unknown";
  console.log("[ProfileLoader] Loader called:", {
    kind: pointer.kind,
    pubkey: pubkeyStr,
    relays: pointer.relays || [],
    identifier: pointer.identifier,
    timestamp: new Date().toISOString(),
  });
  
  const result = originalLoader(pointer);
  
  // Add logging without changing observable creation timing
  return result.pipe(
    tap({
      next: (event) => {
        if (event) {
          console.log("[ProfileLoader] Loader returned event:", {
            kind: event.kind,
            pubkey: event.pubkey?.slice(0, 8) + "...",
            contentLength: event.content?.length || 0,
            contentPreview: event.content?.substring(0, 100) || "empty",
            created_at: event.created_at,
            timestamp: new Date().toISOString(),
          });
        } else {
          console.log("[ProfileLoader] Loader returned null/undefined", {
            pubkey: pubkeyStr,
            timestamp: new Date().toISOString(),
          });
        }
      },
      error: (err) => {
        console.error("[ProfileLoader] Loader error:", {
          pubkey: pubkeyStr,
          error: err,
          timestamp: new Date().toISOString(),
        });
      },
      complete: () => {
        console.log("[ProfileLoader] Loader observable completed:", {
          pubkey: pubkeyStr,
          timestamp: new Date().toISOString(),
        });
      },
    }),
    finalize(() => {
      console.log("[ProfileLoader] Loader observable finalized:", {
        pubkey: pubkeyStr,
        timestamp: new Date().toISOString(),
      });
    })
  );
};

// Assign loaders to event store so profiles are automatically fetched when requested
eventStore.addressableLoader = debugLoader;
eventStore.replaceableLoader = debugLoader;

console.log("[ProfileLoader] Address loader configured with lookup relays:", DEFAULT_RELAYS);
console.log("[ProfileLoader] Event store loaders assigned:", {
  hasAddressableLoader: !!eventStore.addressableLoader,
  hasReplaceableLoader: !!eventStore.replaceableLoader,
});

// Relays are created lazily when accessed via pool.relay(url)
// No need to pre-initialize them

// Create factory with extension signer
let signer: ExtensionSigner | null = null;
let factory: EventFactory | null = null;

export function getSigner(): ExtensionSigner | null {
  if (typeof window === "undefined") return null;
  
  if (!signer && window.nostr) {
    signer = new ExtensionSigner();
  }
  
  return signer;
}

export function getFactory(): EventFactory {
  if (!factory) {
    const currentSigner = getSigner();
    factory = new EventFactory({
      signer: currentSigner || undefined,
    });
  }
  
  return factory;
}

export function updateFactorySigner() {
  const currentSigner = getSigner();
  factory = new EventFactory({
    signer: currentSigner || undefined,
  });
}

// Helper to publish events
export async function publishEvent(event: any) {
  await pool.publish(DEFAULT_RELAYS, event);
}
