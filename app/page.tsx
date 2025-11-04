"use client";

import { useState } from "react";
import LoginButton from "@/components/LoginButton";
import PostForm from "@/components/PostForm";
import Feed from "@/components/Feed";

export default function Home() {
  const [pubkey, setPubkey] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogin = (userPubkey: string) => {
    setPubkey(userPubkey);
  };

  const handlePostSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {!pubkey ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <LoginButton onLogin={handleLogin} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {showSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-lg shadow-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Post published successfully!</span>
                </div>
              </div>
            )}
            
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <PostForm onPostSuccess={handlePostSuccess} />
            </div>

            <Feed />
          </div>
        )}
      </div>
    </main>
  );
}
