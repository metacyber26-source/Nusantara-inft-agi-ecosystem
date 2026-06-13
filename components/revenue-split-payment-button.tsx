"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
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
import { PRODUCT_CONFIG } from "@/lib/product-config"

interface RevenueSplitPaymentButtonProps {
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  fullWidth?: boolean
  onSuccess?: () => void
  autoTrigger?: boolean // Automatically show dialog on mount
}

export function RevenueSplitPaymentButton({
  variant = "default",
  size = "default",
  fullWidth = true,
  onSuccess,
  autoTrigger = true,
}: RevenueSplitPaymentButtonProps) {
  const { products, sdk, restoredPurchases } = usePiAuth()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(autoTrigger)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    details?: any
  } | null>(null)

  // Revenue Split Distribution product ID
  const productId = PRODUCT_CONFIG.PRODUCT_6a2b30c63c0d80890d1f8a06
  const product = products?.find((p) => p.id === productId)

  // Check if user has already purchased this product
  const hasPurchased = restoredPurchases?.find(
    (p) => p.productId === productId
  )

  // Check if product quantity is available (for consumable check)
  const productQuantity = restoredPurchases?.find(
    (p) => p.productId === productId
  )?.quantity ?? 0

  if (!product) {
    return (
      <Button
        disabled
        variant={variant}
        size={size}
        className={fullWidth ? "w-full" : ""}
      >
        Loading product...
      </Button>
    )
  }

  const handlePurchase = async () => {
    if (!sdk) {
      setResult({
        type: "error",
        message: "SDK not initialized. Please refresh and try again.",
      })
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Attempting Revenue Split purchase for product:", product.id)

      // Use product.slug for the actual purchase call
      const purchaseResult = await sdk.makePurchase(product.slug)

      if (purchaseResult.ok) {
        console.log("[v0] Revenue Split purchase successful:", purchaseResult)

        setResult({
          type: "success",
          message: "Revenue Split Distribution activated!",
          details: {
            productId: purchaseResult.productId,
            paymentId: purchaseResult.paymentId,
            txid: purchaseResult.txid,
          },
        })

        // Call success callback
        onSuccess?.()

        // Refresh page after short delay to sync purchases
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error: any) {
      const errorCode = error?.code || "unknown"
      const errorMessages: Record<string, string> = {
        product_not_found: "Revenue Split product not found. Please try again.",
        purchase_cancelled: "Purchase cancelled.",
        purchase_error: "Purchase failed. Please try again.",
        unknown: "An error occurred. Please try again.",
      }

      console.error("[v0] Revenue Split purchase error:", error)

      setResult({
        type: "error",
        message: errorMessages[errorCode] || errorMessages.unknown,
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  // If already purchased, show confirmation or return null
  if (hasPurchased && !autoTrigger) {
    return null
  }

  return (
    <>
      {/* Button trigger (only shown if autoTrigger is false) */}
      {!autoTrigger && (
        <Button
          onClick={() => setShowDialog(true)}
          disabled={loading}
          variant={variant}
          size={size}
          className={fullWidth ? "w-full" : ""}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : hasPurchased ? (
            <>
              ✓ Revenue Split (Active)
            </>
          ) : (
            <>
              💰 Enable Revenue Split · {product.price_in_pi} Pi
            </>
          )}
        </Button>
      )}

      {/* Payment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revenue Split Distribution</DialogTitle>
            <DialogDescription>
              Activate automated revenue distribution system initialization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {result ? (
              <>
                <Alert
                  className={
                    result.type === "success"
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-red-500/50 bg-red-500/10"
                  }
                >
                  {result.type === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <AlertDescription
                    className={
                      result.type === "success"
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }
                  >
                    {result.message}
                  </AlertDescription>
                </Alert>

                {result.type === "success" && result.details && (
                  <div className="space-y-2 rounded-lg bg-secondary p-3 text-xs">
                    <p>
                      <strong>Transaction ID:</strong> {result.details.txid}
                    </p>
                    <p>
                      <strong>Payment ID:</strong> {result.details.paymentId}
                    </p>
                  </div>
                )}
              </>
            ) : hasPurchased ? (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Revenue Split Distribution is already active on your account!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-sm font-medium mb-2">System Integration</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {product.description}
                  </p>

                  <div className="space-y-2 text-xs">
                    <p className="font-medium text-foreground">Revenue Distribution:</p>
                    <ul className="space-y-1 ml-2 text-muted-foreground">
                      <li>• Primary/Rental: 50% User, 15% Dev, 20% Community, 10% Server, 5% Gas</li>
                      <li>• Mint Fee: 20% Dev, 30% Community, 40% Server, 10% Gas</li>
                      <li>• Secondary Royalty: 10% Creator, 20% Dev, 30% Community, 35% Server, 5% Gas</li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-1">One-time activation fee</p>
                    <p className="text-lg font-bold text-primary">
                      {product.price_in_pi} Pi
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDialog(false)
                setResult(null)
              }}
              disabled={loading}
            >
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && !hasPurchased && (
              <Button
                type="button"
                onClick={handlePurchase}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  `Activate for ${product.price_in_pi} Pi`
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
