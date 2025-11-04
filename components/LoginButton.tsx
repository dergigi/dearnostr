"use client";

import { ExtensionSigner, ExtensionMissingError } from "applesauce-signers";
import { getSigner, updateFactorySigner } from "@/lib/nostr";
import { useEffect, useState } from "react";

export default function LoginButton({
  onLogin,
}: {
  onLogin: (pubkey: string) => void;
}) {
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setExtensionAvailable(!!window.nostr);
    }
  }, []);

  const handleLogin = async () => {
    if (!window.nostr) {
      setError("Nostr extension not found. Please install a Nostr extension like Alby or nos2x.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const signer = getSigner();
      if (!signer) {
        throw new ExtensionMissingError("Extension not available");
      }

      const userPubkey = await signer.getPublicKey();
      setPubkey(userPubkey);
      updateFactorySigner();
      onLogin(userPubkey);
    } catch (err) {
      if (err instanceof ExtensionMissingError) {
        setError("Extension not available. Please install a Nostr extension.");
      } else {
        setError("Failed to connect. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setPubkey(null);
    onLogin("");
  };

  if (pubkey) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            Connected: {pubkey.slice(0, 8)}...{pubkey.slice(-8)}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleLogin}
        disabled={!extensionAvailable || loading}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200"
      >
        {loading ? "Connecting..." : "Login with Extension"}
      </button>
      {!extensionAvailable && (
        <p className="text-sm text-gray-500 text-center max-w-md px-4">
          Nostr extension not detected. Please install a Nostr extension like Alby or nos2x to continue.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 text-center max-w-md px-4 bg-red-50 border border-red-200 rounded-lg py-2">
          {error}
        </p>
      )}
    </div>
  );
}
