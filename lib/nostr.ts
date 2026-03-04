import { EventStore } from "applesauce-core";
import { EventFactory } from "applesauce-factory";
import { createAddressLoader } from "applesauce-loaders/loaders";
import { RelayPool } from "applesauce-relay";
import { ExtensionSigner } from "applesauce-signers";
import { DEFAULT_RELAYS } from "./constants";

// Create singleton instances
export const pool = new RelayPool();
export const eventStore = new EventStore();

// Create address loader for automatically fetching profiles and other replaceable events
const addressLoader = createAddressLoader(pool, {
  eventStore,
  lookupRelays: DEFAULT_RELAYS,
});

// Assign loaders to event store so profiles are automatically fetched when requested
eventStore.addressableLoader = addressLoader;
eventStore.replaceableLoader = addressLoader;

// Initialize signer and factory
// Signer is optional until user logs in with extension
export const factory = new EventFactory({
  signer: typeof window !== "undefined" && window.nostr ? new ExtensionSigner() : undefined,
});

export function getSigner(): ExtensionSigner | undefined {
  return factory.signer as ExtensionSigner | undefined;
}

export function getFactory(): EventFactory {
  return factory;
}

export function updateFactorySigner() {
  if (typeof window !== "undefined" && window.nostr) {
    factory.signer = new ExtensionSigner();
  }
}

// Helper to publish events
export async function publishEvent(event: any) {
  await pool.publish(DEFAULT_RELAYS, event);
}
