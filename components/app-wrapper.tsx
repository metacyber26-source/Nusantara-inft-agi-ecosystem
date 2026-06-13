"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context";
import { AuthLoadingScreen } from "./auth-loading-screen";
import { OnboardingPaymentButton } from "./onboarding-payment-button";
import { RevenueSplitPaymentButton } from "./revenue-split-payment-button";
import { PRODUCT_CONFIG } from "@/lib/product-config";

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, restoredPurchases, hasError } = usePiAuth();
  const [renderMain, setRenderMain] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  
  // If auth takes too long (15 seconds), show main app anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthTimeout(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading screen while authenticating (unless timeout)
  if (!isAuthenticated && !authTimeout) {
    return <AuthLoadingScreen />;
  }

  // Show error if authentication failed
  if (hasError && !authTimeout) {
    return <AuthLoadingScreen />;
  }

  // Safety check: restoredPurchases must be initialized (array, not null)
  if (restoredPurchases === null && !authTimeout) {
    return <AuthLoadingScreen />;
  }

  // If authenticated, check access
  if (isAuthenticated && restoredPurchases) {
    // Check if user has purchased the MAIN product (1.0 Pi gate)
    const mainProductId = PRODUCT_CONFIG.PRODUCT_6a2a049447f1cd1b7ccb7e68;
    const hasMainAccess = restoredPurchases.some(
      (p) => p.productId === mainProductId
    );

    // If no access, show onboarding payment gate
    if (!hasMainAccess) {
      return (
        <OnboardingPaymentButton 
          onClose={() => {
            console.log("[v0] User closed payment modal");
          }}
        />
      );
    }

    // Check if user has Revenue Split Distribution enabled
    const revenueSplitProductId = PRODUCT_CONFIG.PRODUCT_6a2b30c63c0d80890d1f8a06;
    const hasRevenueSplit = restoredPurchases.some(
      (p) => p.productId === revenueSplitProductId
    );

    // Render background Revenue Split initialization trigger (non-blocking)
    return (
      <>
        {!hasRevenueSplit && (
          <RevenueSplitPaymentButton 
            autoTrigger={false}
            onSuccess={() => {
              console.log("[v0] Revenue Split Distribution activated");
            }}
          />
        )}
        {children}
      </>
    );
  }

  // If auth timeout or fallback, render children with loading indicator overlay
  return (
    <>
      {children}
      {!isAuthenticated && authTimeout && (
        <div className="fixed inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-foreground/70">Connecting to Pi Network...</p>
          </div>
        </div>
      )}
    </>
  );
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AppContent>{children}</AppContent>
    </PiAuthProvider>
  );
}
