"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Loader2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { PRODUCT_CONFIG, PRODUCT_PRICING } from "@/lib/product-config"

interface OnboardingPaymentButtonProps {
  onSuccess?: () => void
  onClose?: () => void
}

export function OnboardingPaymentButton({ onSuccess, onClose }: OnboardingPaymentButtonProps) {
  const { products, sdk, restoredPurchases } = usePiAuth()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(true)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    details?: any
  } | null>(null)

  // Use the main 1.0 Pi product ID - 3D Marketplace Access
  const mainProductId = PRODUCT_CONFIG.PRODUCT_6a2a049447f1cd1b7ccb7e68
  const product = products?.find((p) => p.id === mainProductId)
  const productInfo = PRODUCT_PRICING[mainProductId as keyof typeof PRODUCT_PRICING]

  const hasAccess = restoredPurchases?.find(
    (p) => p.productId === mainProductId
  )

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // When closing, reset state and call onClose
      setShowDialog(false)
      setResult(null)
      onClose?.()
    } else {
      setShowDialog(true)
    }
  }

  // Loading state - show spinner while fetching product
  if (!product || !productInfo) {
    return (
      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Initializing...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading product information...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show success state
  if (hasAccess && result?.type === "success") {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Welcome!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your access to Nusantara Neo iNFT Forge is now active.
            </p>
            <Button
              onClick={() => {
                onSuccess?.()
                window.location.reload()
              }}
              className="w-full"
            >
              Enter Forge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const handlePurchase = async () => {
    if (!sdk) {
      setResult({
        type: "error",
        message: "SDK not initialized. Please refresh the page and try again.",
      })
      return
    }

    if (!product) {
      setResult({
        type: "error",
        message: "Product not found. Please refresh the page and try again.",
      })
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Attempting purchase for product:", product.id)
      
      const purchaseResult = await sdk.makePurchase(product.id)
      
      if (purchaseResult.ok) {
        console.log("[v0] Purchase successful:", purchaseResult)
        setResult({
          type: "success",
          message: "Purchase successful! Redirecting...",
          details: {
            productId: purchaseResult.productId,
            paymentId: purchaseResult.paymentId,
            txid: purchaseResult.txid,
          },
        })
        
        // Auto-reload after short delay to ensure backend sync
        setTimeout(() => {
          onSuccess?.()
          window.location.reload()
        }, 1500)
      } else {
        console.error("[v0] Purchase failed:", purchaseResult)
        setResult({
          type: "error",
          message: purchaseResult.error?.message || "Purchase failed. Please try again.",
        })
      }
    } catch (err) {
      const error = err as any
      console.error("[v0] Purchase error:", error)
      
      // Handle specific error codes
      let errorMessage = "An error occurred. Please try again."
      if (error?.code === "purchase_cancelled") {
        errorMessage = "Purchase cancelled. Your payment was not processed."
      } else if (error?.code === "product_not_found") {
        errorMessage = "Product not found. This is a backend configuration issue."
      } else if (error?.code === "purchase_error") {
        errorMessage = error?.message || "Purchase error. Please try again."
      }
      
      setResult({
        type: "error",
        message: errorMessage,
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  // Main purchase dialog
  return (
    <Dialog open={showDialog} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => {
        // Allow escape to close dialog
        e.preventDefault()
        handleDialogClose(false)
      }}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex-1">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Unlock Forge Access
            </DialogTitle>
            <DialogDescription>
              Get full access to create, mint, and trade iNFTs
            </DialogDescription>
          </div>
          <button
            onClick={() => handleDialogClose(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error message */}
          {result?.type === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {result?.type === "success" && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{result.message}</AlertDescription>
            </Alert>
          )}

          {/* Product info */}
          {!result && (
            <>
              <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-semibold">{productInfo.name}</p>
                <p className="text-xs text-muted-foreground">
                  Unlock access to the full Nusantara Neo iNFT Forge platform, including asset creation, marketplace, and rental system.
                </p>
                <div className="flex items-baseline justify-between pt-2">
                  <span className="text-2xl font-bold text-primary">{productInfo.price}</span>
                  <span className="text-sm font-medium text-primary">Pi</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Your payment is secured by the Pi Network. Transaction fee applies.
              </p>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleDialogClose(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={loading || !!result}
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Processing..." : `Unlock for ${productInfo.price} Pi`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
        }, 2000)
      }
    } catch (error: any) {
      const errorCode = error?.code || "unknown"
      const errorMessages: Record<string, string> = {
        product_not_found: "Product not found. Please try again.",
        purchase_cancelled: "Purchase cancelled.",
        purchase_error: "Purchase failed. Please try again.",
        unknown: "An error occurred. Please try again.",
      }

      setResult({
        type: "error",
        message: errorMessages[errorCode] || errorMessages.unknown,
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  if (hasAccess) {
    return null
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-lg bg-primary/15 p-3">
              <Sparkles className="h-8 w-8 text-primary drop-shadow-[0_0_12px_var(--primary)]" aria-hidden="true" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Nusantara Neo iNFT Forge</DialogTitle>
          <DialogDescription className="text-center">
            ICP2E Jawa Timur Community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {result ? (
            <>
              <Alert className={result.type === "success" ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}>
                {result.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className={result.type === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                  {result.message}
                </AlertDescription>
              </Alert>

              {result.type === "success" && result.details && (
                <div className="space-y-2 rounded-lg bg-secondary p-3 text-xs">
                  <p><strong>Transaction ID:</strong> {result.details.txid}</p>
                  <p><strong>Payment ID:</strong> {result.details.paymentId}</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  Unlock full access to the premier AGI-powered studio
                </p>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Generate, auto-rig, and mint multi-format iNFTs (3D/2D/text) with 3D WebGL preview, bulk minting engine, and secure escrow-based rental hub ready for Web3 games and metaverses.
                </p>
              </div>

              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">ONE-TIME UNLOCK PRICE</p>
                <p className="text-2xl font-bold text-primary">{product.price_in_pi} Pi</p>
              </div>

              <ul className="space-y-2 text-xs">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Generate interactive iNFTs from text, 2D, or 3D inputs</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Auto-rig and convert to GLTF/GLB/FBX/VRM formats</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Mint and sell across multiple metaverses</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Escrow-based rental system for Rent-to-Earn</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Multilingual iNFTs (EN/ID/JV)</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {result?.type === "error" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setResult(null)}
              className="flex-1"
            >
              Try Again
            </Button>
          )}
          {!result && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Unlock for ${product.price_in_pi} Pi`
                )}
              </Button>
            </>
          )}
          {result?.type === "success" && (
            <Button
              type="button"
              onClick={() => setShowDialog(false)}
              className="flex-1"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
