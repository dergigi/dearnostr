import { EventStore } from "applesauce-core";
import { EventFactory } from "applesauce-factory";
import { RelayPool } from "applesauce-relay";
import { ExtensionSigner } from "applesauce-signers";
import { DEFAULT_RELAYS } from "./constants";

// Extend Window interface to include nostr property
declare global {
  interface Window {
    nostr?: any;
  }
}

// Create singleton instances
export const pool = new RelayPool();
export const eventStore = new EventStore();

// Initialize default relays
DEFAULT_RELAYS.forEach((relay) => {
  pool.add(relay);
});

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
  await pool.publish(event, DEFAULT_RELAYS);
}
