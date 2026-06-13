"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Loader2, Zap } from "lucide-react"
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

interface ForgeCreditsPaymentButtonProps {
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  fullWidth?: boolean
  compact?: boolean
}

export function ForgeCreditsPaymentButton({
  variant = "default",
  size = "default",
  fullWidth = true,
  compact = false,
}: ForgeCreditsPaymentButtonProps) {
  const { products, sdk, restoredPurchases } = usePiAuth()
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
    details?: any
  } | null>(null)

  // Use Smart iNFT Forge Credit product ID
  const product = products?.find(
    (p) => p.id === PRODUCT_CONFIG.PRODUCT_6a2b0741cbb06fbaa848d778
  )

  // Get quantity from restored purchases
  const purchaseInfo = restoredPurchases?.find(
    (p) => p.productId === PRODUCT_CONFIG.PRODUCT_6a2b0741cbb06fbaa848d778
  )
  const quantity = purchaseInfo?.quantity ?? 0

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
          message: "Purchase successful! Credits added to your account.",
          details: {
            productId: purchaseResult.productId,
            paymentId: purchaseResult.paymentId,
            txid: purchaseResult.txid,
          },
        })
        // Refresh after successful purchase
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

  if (compact) {
    // Compact card version for dashboard
    return (
      <>
        <button
          onClick={() => setShowDialog(true)}
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 p-4 transition-all hover:border-primary/40 hover:from-primary/15 hover:to-accent/10 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/20 p-2">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted-foreground">50 Minting Credits</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{product.price_in_pi}</p>
                <p className="text-xs text-muted-foreground">Pi</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Locked in fair ecosystem revenue splits · Bypass standard limits
            </p>
          </div>
        </button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Smart iNFT Forge Credits
              </DialogTitle>
              <DialogDescription>
                Purchase premium minting credits for advanced iNFT generation
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
                    <div className="space-y-2 rounded-lg bg-secondary p-3 text-xs">
                      <p><strong>Transaction ID:</strong> {result.details.txid}</p>
                      <p><strong>Payment ID:</strong> {result.details.paymentId}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <div className="flex items-baseline justify-between pt-2">
                      <span className="text-2xl font-bold text-primary">{product.price_in_pi}</span>
                      <span className="text-sm font-medium text-primary">Pi</span>
                    </div>
                  </div>

                  {quantity > 0 && (
                    <Alert className="border-blue-500/50 bg-blue-500/10">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <AlertDescription className="text-blue-700 dark:text-blue-400">
                        You currently have {quantity} credits available
                      </AlertDescription>
                    </Alert>
                  )}

                  <ul className="space-y-2 text-xs">
                    <li className="flex gap-2">
                      <span className="text-primary">✓</span>
                      <span>50 premium minting credits included</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">✓</span>
                      <span>Reduced per-transaction network costs</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">✓</span>
                      <span>Locked fair community revenue splits</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">✓</span>
                      <span>Bypass standard limits for high-volume creators</span>
                    </li>
                  </ul>
                </>
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
              {!result && (
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
                    `Get for ${product.price_in_pi} Pi`
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Standard button version
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
        ) : quantity > 0 ? (
          <>
            ⚡ {quantity} Credits Available
          </>
        ) : (
          <>
            ⚡ Get Forge Credits · {product.price_in_pi} Pi
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Smart iNFT Forge Credits
            </DialogTitle>
            <DialogDescription>
              Purchase premium minting credits for advanced iNFT generation
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
                  <div className="space-y-2 rounded-lg bg-secondary p-3 text-xs">
                    <p><strong>Transaction ID:</strong> {result.details.txid}</p>
                    <p><strong>Payment ID:</strong> {result.details.paymentId}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="text-2xl font-bold text-primary">{product.price_in_pi}</span>
                    <span className="text-sm font-medium text-primary">Pi</span>
                  </div>
                </div>

                {quantity > 0 && (
                  <Alert className="border-blue-500/50 bg-blue-500/10">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      You currently have {quantity} credits available
                    </AlertDescription>
                  </Alert>
                )}

                <ul className="space-y-2 text-xs">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>50 premium minting credits included</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Reduced per-transaction network costs</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Locked fair community revenue splits</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Bypass standard limits for high-volume creators</span>
                  </li>
                </ul>
              </>
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
            {!result && (
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
                  `Get for ${product.price_in_pi} Pi`
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
