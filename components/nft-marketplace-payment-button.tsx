"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Loader2, Lock } from "lucide-react"
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

interface NftMarketplacePaymentButtonProps {
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  fullWidth?: boolean
}

export function NftMarketplacePaymentButton({
  variant = "default",
  size = "lg",
  fullWidth = true,
}: NftMarketplacePaymentButtonProps) {
  const { products, sdk, restoredPurchases } = usePiAuth()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    details?: any
  } | null>(null)

  const product = products?.find(
    (p) => p.id === PRODUCT_CONFIG.PRODUCT_6a2ad947bd32f55fefb40d90
  )

  const hasAccess = restoredPurchases?.find(
    (p) => p.productId === product?.id
  )

  if (!product) {
    return (
      <Button disabled variant={variant} size={size} className={fullWidth ? "w-full" : ""}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          message: "NFT Content Marketplace access unlocked! 🎉",
          details: {
            productId: purchaseResult.productId,
            paymentId: purchaseResult.paymentId,
            txid: purchaseResult.txid,
          },
        })
        // Refresh the page after 2 seconds to load updated purchases
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
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            NFT Marketplace (Unlocked)
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Unlock NFT Marketplace · {product.price_in_pi} Pi
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>NFT Content Marketplace</DialogTitle>
            <DialogDescription>
              Unlock full access to the decentralized digital content hub. Seamlessly trade, showcase, and license your traditional Indonesian and modern digital assets, integrated directly with your secure Pi wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                  <div className="space-y-2 rounded-lg bg-secondary p-3 text-xs font-mono">
                    <p><strong>Transaction:</strong> {result.details.txid?.slice(0, 16)}...</p>
                    <p><strong>Payment ID:</strong> {result.details.paymentId?.slice(0, 16)}...</p>
                  </div>
                )}
              </>
            ) : hasAccess ? (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  You have full access to the NFT Content Marketplace!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-secondary p-4 space-y-2">
                  <p className="text-sm font-semibold">Features Included:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>✓ Trade & showcase NFTs</li>
                    <li>✓ License digital assets</li>
                    <li>✓ Access Indonesian & modern collections</li>
                    <li>✓ Secure Pi wallet integration</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 border border-primary/20">
                  <p className="text-lg font-bold text-primary">{product.price_in_pi} Pi</p>
                  <p className="text-xs text-muted-foreground mt-1">One-time purchase for lifetime access</p>
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
