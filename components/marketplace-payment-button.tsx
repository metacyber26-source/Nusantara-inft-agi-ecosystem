"use client"

import { useState } from "react"
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

interface MarketplacePaymentButtonProps {
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  fullWidth?: boolean
}

export function MarketplacePaymentButton({
  variant = "default",
  size = "default",
  fullWidth = true,
}: MarketplacePaymentButtonProps) {
  const { products, sdk, restoredPurchases } = usePiAuth()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    details?: any
  } | null>(null)

  const product = products?.find(
    (p) => p.id === PRODUCT_CONFIG.PRODUCT_6a2a05c365ccf1a5ddd44e70
  )

  const hasAccess = restoredPurchases?.find(
    (p) => p.productId === PRODUCT_CONFIG.PRODUCT_6a2a05c365ccf1a5ddd44e70
  )

  if (!product) {
    return (
      <Button disabled variant={variant} size={size} className={fullWidth ? "w-full" : ""}>
        Loading...
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
      const purchaseResult = await sdk.makePurchase(product.id)
      
      if (purchaseResult.ok) {
        setResult({
          type: "success",
          message: "Purchase successful!",
          details: {
            productId: purchaseResult.productId,
            paymentId: purchaseResult.paymentId,
            txid: purchaseResult.txid,
          },
        })
        // Refresh purchases by reinitializing auth context if needed
        setTimeout(() => {
          window.location.reload()
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

  return (
    <>
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
        ) : hasAccess ? (
          <>
            ✓ 3D Marketplace (Unlocked)
          </>
        ) : (
          <>
            🎯 Unlock 3D Marketplace · {product.price_in_pi} Pi
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>3D Asset Marketplace</DialogTitle>
            <DialogDescription>
              Access the premium WebGL 3D preview marketplace. Buy, sell, and rent fully
              interactive, auto-rigged multi-format iNFTs with real-time 3D model rotation and zoom.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {result ? (
              <>
                <Alert className={result.type === "success" ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"}>
                  <AlertCircle className={`h-4 w-4 ${result.type === "success" ? "text-green-500" : "text-red-500"}`} />
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
            ) : hasAccess ? (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  You already have access to the 3D Marketplace!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-sm font-medium">Product Details</p>
                  <p className="mt-1 text-xs text-muted-foreground">{product.description}</p>
                  <p className="mt-2 text-sm font-bold text-primary">{product.price_in_pi} Pi</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && !hasAccess && (
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
                  `Purchase for ${product.price_in_pi} Pi`
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
