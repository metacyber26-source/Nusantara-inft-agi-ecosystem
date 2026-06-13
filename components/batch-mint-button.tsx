"use client"

import { useState } from "react"
import { Loader2, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { PRODUCT_CONFIG } from "@/lib/product-config"

interface BatchMintButtonProps {
  disabled?: boolean
  onSuccess?: () => void
  onError?: (message: string) => void
}

export function BatchMintButton({
  disabled = false,
  onSuccess,
  onError,
}: BatchMintButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const piAuth = usePiAuth()

  const products = piAuth?.products
  const restoredPurchases = piAuth?.restoredPurchases
  const sdk = piAuth?.sdk

  // Find the batch minting product
  const batchProduct = products?.find(
    (p) => p.id === PRODUCT_CONFIG.PRODUCT_6a2a049447f1cd1b7ccb7e68
  )

  // Check if product already purchased
  const purchaseQuantity =
    restoredPurchases?.find(
      (p) => p.productId === batchProduct?.slug
    )?.quantity ?? 0

  // Disable if product not found
  if (!batchProduct) {
    return (
      <Button
        disabled
        variant="outline"
        className="flex-1"
        title="Batch minting product not available"
      >
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        Batch Mint Unavailable
      </Button>
    )
  }

  const handlePurchase = async () => {
    if (!sdk) {
      setError("SDK not initialized")
      onError?.("SDK not initialized")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await sdk.makePurchase(batchProduct.slug)

      if (result.ok) {
        console.log("[BatchMint] Purchase successful", {
          productId: result.productId,
          paymentId: result.paymentId,
          txid: result.txid,
        })

        // Consume the product since it's consumable
        try {
          await sdk.state.consume(batchProduct.slug, 1)
          console.log("[BatchMint] Product consumed successfully")
        } catch (consumeError) {
          console.error("[BatchMint] Failed to consume product:", consumeError)
        }

        setIsLoading(false)
        onSuccess?.()
      } else {
        throw new Error("Purchase failed")
      }
    } catch (err) {
      const errorMessage = (err as any)?.code ?? "purchase_error"
      console.error("[BatchMint] Purchase error:", err)

      let displayMessage = "Failed to complete purchase"
      if (errorMessage === "product_not_found") {
        displayMessage = "Product not found"
      } else if (errorMessage === "purchase_cancelled") {
        displayMessage = "Purchase cancelled"
      }

      setError(displayMessage)
      onError?.(displayMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePurchase}
        disabled={disabled || isLoading}
        className="flex-1"
        variant={purchaseQuantity > 0 ? "default" : "outline"}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" aria-hidden="true" />
            {purchaseQuantity > 0 ? "Use Batch Mint" : "Batch Mint Engine"}
            {purchaseQuantity > 0 && ` (${purchaseQuantity})`}
          </>
        )}
      </Button>
      {purchaseQuantity > 0 && (
        <p className="text-xs text-accent">Batch mint available · Generate up to 100 iNFTs</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {batchProduct.price_in_pi} Pi · Bulk generation, auto-rigging, unique variations
      </p>
    </div>
  )
}
