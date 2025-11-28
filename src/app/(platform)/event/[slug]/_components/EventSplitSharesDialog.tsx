import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface EventSplitSharesDialogProps {
  open: boolean
  availableUsdc: number
  onOpenChange: (open: boolean) => void
}

export default function EventSplitSharesDialog({
  open,
  availableUsdc,
  onOpenChange,
}: EventSplitSharesDialogProps) {
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!open) {
      setAmount('')
    }
  }, [open])

  const formattedUsdcBalance = useMemo(() => {
    if (!Number.isFinite(availableUsdc)) {
      return '$0.00'
    }
    return availableUsdc.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [availableUsdc])

  function handleMaxClick() {
    if (!Number.isFinite(availableUsdc)) {
      return
    }

    setAmount(availableUsdc.toFixed(2))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:p-8">
        <div className="space-y-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-center text-2xl font-bold">Split shares</DialogTitle>
            <DialogDescription className="text-sm text-foreground">
              Split a USDC into a share of Yes and No. You can do this to save cost by getting both and just selling the other side.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="split-shares-amount">
              Amount
            </label>
            <Input
              id="split-shares-amount"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              className="h-12 text-base"
            />
            <div className="text-xs text-foreground/80">
              <span className="flex items-center gap-1">
                Available:
                <strong className="text-foreground">{formattedUsdcBalance}</strong>
                <span className="text-muted-foreground">USDC</span>
                <button
                  type="button"
                  className={cn(
                    'text-primary transition-colors',
                    Number(availableUsdc) > 0 ? 'hover:opacity-80' : 'cursor-not-allowed opacity-40',
                  )}
                  onClick={handleMaxClick}
                  disabled={!Number.isFinite(availableUsdc) || availableUsdc <= 0}
                >
                  Max
                </button>
              </span>
            </div>
          </div>

          <Button type="button" size="outcome" className="w-full text-base font-bold">
            Split Shares
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
