"use client";

import { ExtensionSigner, ExtensionMissingError } from "applesauce-signers";
import { getSigner, updateFactorySigner } from "@/lib/nostr";
import { ALBY_EXTENSION_URL, NOS2X_EXTENSION_URL, KEYCHAT_URL, AMBER_URL, EXTENSION_INSTALL_MESSAGE, EXTENSION_INSTALL_MESSAGE_ANDROID } from "@/lib/constants";
import { isAndroid } from "@/lib/utils";
import { useEffect, useState, ReactNode, useMemo } from "react";

export default function LoginButton({
  onLogin,
}: {
  onLogin: (pubkey: string) => void;
}) {
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [error, setError] = useState<ReactNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  const extensionMessage = useMemo(() => {
    return isAndroid() ? EXTENSION_INSTALL_MESSAGE_ANDROID : EXTENSION_INSTALL_MESSAGE;
  }, []);

  const ExtensionInstallMessage = ({ message }: { message: string }) => {
    const linkMap: Record<string, string> = {
      Alby: ALBY_EXTENSION_URL,
      nos2x: NOS2X_EXTENSION_URL,
      Keychat: KEYCHAT_URL,
      Amber: AMBER_URL,
    };

    const parts = message.split(/(Alby|nos2x|Keychat|Amber)/i);
    return (
      <>
        {parts.map((part, index) => {
          // Normalize case for lookup: capitalize first letter
          const normalizedKey = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          const url = linkMap[normalizedKey] || linkMap[part];
          if (url) {
            return (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-900"
              >
                {part}
              </a>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkExtension = () => {
      const available = !!window.nostr;
      setExtensionAvailable(available);
      return available;
    };
    
    checkExtension();
    
    // Check periodically until extension is found or 10 seconds pass
    const intervalId = setInterval(() => {
      if (checkExtension()) clearInterval(intervalId);
    }, 500);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 10000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleLogin = async () => {
    if (!window.nostr) {
      setError(<ExtensionInstallMessage message={extensionMessage} />);
      return;
    }

    setUnlocking(true);
    setError(null);

    // Wait for unlock animation to complete
    await new Promise(resolve => setTimeout(resolve, 600));

    setLoading(true);

    try {
      const signer = getSigner();
      if (!signer) {
        throw new ExtensionMissingError("Extension not available");
      }

      const userPubkey = await signer.getPublicKey();
      
      // Show unlock animation
      setUnlocked(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPubkey(userPubkey);
      updateFactorySigner();
      setShowConnectionStatus(true);
      onLogin(userPubkey);
    } catch (err) {
      setUnlocking(false);
      setUnlocked(false);
      if (err instanceof ExtensionMissingError) {
        setError(<ExtensionInstallMessage message={extensionMessage} />);
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
    setUnlocking(false);
    setUnlocked(false);
    setShowConnectionStatus(false);
    onLogin("");
  };

  if (pubkey && showConnectionStatus) {
    return (
      <div className="flex flex-col items-center gap-3 fade-in">
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg">
          <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
          <span className="text-sm font-semibold text-amber-900">
            Connected: {pubkey.slice(0, 8)}...{pubkey.slice(-8)}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
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
        disabled={!extensionAvailable || loading || unlocking}
        className="relative group"
        aria-label="Unlock diary"
      >
        {unlocked ? (
          <div className="padlock-unlocked">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-700"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        ) : (
          <div className={`relative ${unlocking ? 'padlock-unlocking' : ''}`}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-amber-700 transition-all duration-200 ${!extensionAvailable || loading ? 'opacity-50' : 'group-hover:scale-110 cursor-pointer'}`}
            >
              {/* Body - rendered first so shackle appears on top */}
              <rect
                className="padlock-body"
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
              />
              {/* Shackle - rendered on top */}
              <path
                className="padlock-shackle"
                d="M6 11V7a6 6 0 0 1 12 0v4"
              />
            </svg>
          </div>
        )}
      </button>
      
      {!extensionAvailable && !unlocking && !unlocked && (
        <p className="text-sm text-amber-700 text-center max-w-md px-4">
          <ExtensionInstallMessage message={extensionMessage} />
        </p>
      )}
      {error && (
        <p className="text-sm text-red-700 text-center max-w-md px-4 bg-red-50 border border-red-200 rounded-lg py-2">
          {error}
        </p>
      )}
    </div>
  );
}
