// Type definitions for Nostr browser extensions
interface Nostr {
  getPublicKey(): Promise<string>;
  signEvent(event: {
    kind: number;
    tags: string[][];
    content: string;
    created_at: number;
    pubkey: string;
  }): Promise<{
    id: string;
    sig: string;
    kind: number;
    tags: string[][];
    content: string;
    created_at: number;
    pubkey: string;
  }>;
  signSchnorr?(message: string): Promise<string>;
  nip04?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
  nip44?: {
    encrypt(pubkey: string, plaintext: string): Promise<string>;
    decrypt(pubkey: string, ciphertext: string): Promise<string>;
  };
}

interface Window {
  nostr?: Nostr;
}

