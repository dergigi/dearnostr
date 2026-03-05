import { EventStore } from "applesauce-core";
import { EventFactory } from "applesauce-factory";
import { createEventLoaderForStore } from "applesauce-loaders/loaders";
import { RelayPool } from "applesauce-relay";
import { ExtensionSigner } from "applesauce-signers";
import { DEFAULT_RELAYS } from "./constants";

// Create singleton instances
export const pool = new RelayPool();
export const eventStore = new EventStore();

// Connect the event store to the relay pool for automatic event loading
createEventLoaderForStore(eventStore, pool, {
  lookupRelays: DEFAULT_RELAYS,
});

// Initialize signer and factory
// Signer is optional until user logs in with extension
export const factory = new EventFactory({
  signer: typeof window !== "undefined" && window.nostr ? new ExtensionSigner() : undefined,
});

export function getSigner(): ExtensionSigner | undefined {
  return factory.context.signer as ExtensionSigner | undefined;
}

export function getFactory(): EventFactory {
  return factory;
}

export function updateFactorySigner() {
  if (typeof window !== "undefined" && window.nostr) {
    factory.context.signer = new ExtensionSigner();
  }
}

// Helper to publish events
export async function publishEvent(event: any) {
  await pool.publish(DEFAULT_RELAYS, event);
}
