"use client";

import { useEffect, useState } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";

export function AuthLoadingScreen() {
  const { authMessage, hasError, reinitialize } = usePiAuth();
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    // Show timeout message after 20 seconds if still loading
    const timer = setTimeout(() => {
      if (!hasError) {
        setIsTimeout(true);
      }
    }, 20000);

    return () => clearTimeout(timer);
  }, [hasError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6 text-center space-y-6">
        <div className="flex justify-center">
          {hasError ? (
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-destructive"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          ) : (
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            {hasError ? "Authentication Failed" : "Pi Network Authentication"}
          </h2>
          <p
            className={`text-sm ${
              hasError ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {authMessage}
          </p>
        </div>

        {isTimeout && !hasError && (
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-left">
            <p className="text-sm text-amber-700 font-medium mb-2">
              ⏱️ Taking longer than expected
            </p>
            <p className="text-xs text-amber-600 mb-3">
              The Pi SDK initialization is taking longer than usual. This typically happens when:
            </p>
            <ul className="text-xs text-amber-600 list-disc list-inside space-y-1 mb-3">
              <li>Pi Developer Portal isn't configured (Step 10)</li>
              <li>Network connection is slow</li>
              <li>Browser cache needs clearing</li>
            </ul>
            <button
              onClick={() => {
                setIsTimeout(false);
                reinitialize();
              }}
              className="px-3 py-2 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700 transition-colors w-full"
            >
              Try Again
            </button>
          </div>
        )}

        {hasError && (
          <div className="space-y-3">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-left">
              <p className="text-sm text-destructive font-medium mb-2">
                🔧 Configuration Required
              </p>
              <p className="text-xs text-destructive/80 mb-2">
                To fix this issue, configure your app in the Pi Developer Portal:
              </p>
              <ol className="text-xs text-destructive/80 list-decimal list-inside space-y-1">
                <li>Go to: <code className="bg-destructive/20 px-1 rounded">develop.pi</code></li>
                <li>Set Target URL: <code className="bg-destructive/20 px-1 rounded">https://nusantara-neo.vercel.app</code></li>
                <li>Configure payment webhooks</li>
                <li>Reload this page</li>
              </ol>
            </div>

            <button
              onClick={reinitialize}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium w-full"
            >
              Retry Authentication
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
