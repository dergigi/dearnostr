"use client";

import { useState } from "react";
import LoginButton from "@/components/LoginButton";
import PostForm from "@/components/PostForm";
import Feed from "@/components/Feed";

export default function Home() {
  const [pubkey, setPubkey] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFeed, setShowFeed] = useState(false);
  const [isAbove210, setIsAbove210] = useState(false);
  const [isAbove420, setIsAbove420] = useState(false);

  const handleLogin = (userPubkey: string) => {
    setPubkey(userPubkey);
  };

  const handlePostSuccess = () => {
    setShowSuccess(true);
    setShowFeed(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleThresholdChange = (above210: boolean, above420: boolean) => {
    setIsAbove210(above210);
    setIsAbove420(above420);
  };

  const getBorderClass = () => {
    if (isAbove420) return "border-red-600";
    if (isAbove210) return "border-orange-600";
    return "border-amber-200";
  };

  return (
    <main className="min-h-screen lined-paper py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {!pubkey ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="bg-amber-50 rounded-lg shadow-md p-8 border border-amber-200">
              <LoginButton onLogin={handleLogin} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {showSuccess && (
              <div className="bg-amber-100 border-l-4 border-amber-600 text-amber-900 px-6 py-4 rounded-lg shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Post published successfully!</span>
                </div>
              </div>
            )}
            
            <div className={`bg-amber-50 border rounded-lg shadow-sm p-6 transition-colors duration-300 ${getBorderClass()}`}>
              <PostForm 
                onPostSuccess={handlePostSuccess} 
                onThresholdChange={handleThresholdChange}
              />
            </div>

            {showFeed && <Feed />}
          </div>
        )}
      </div>
    </main>
  );
}
