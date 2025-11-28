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

interface EventMergeSharesDialogProps {
  open: boolean
  availableShares: number
  onOpenChange: (open: boolean) => void
}

export default function EventMergeSharesDialog({
  open,
  availableShares,
  onOpenChange,
}: EventMergeSharesDialogProps) {
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (!open) {
      setAmount('')
    }
  }, [open])

  const formattedAvailableShares = useMemo(() => {
    if (!Number.isFinite(availableShares)) {
      return '0.0'
    }

    return availableShares.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 4,
    })
  }, [availableShares])

  function handleMaxClick() {
    if (!Number.isFinite(availableShares)) {
      return
    }

    setAmount(formattedAvailableShares.replace(/,/g, ''))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:p-8">
        <div className="space-y-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-center text-2xl font-bold">Merge shares</DialogTitle>
            <DialogDescription className="text-sm text-foreground">
              Merge a share of Yes and No to get 1 USDC. You can do this to save cost when trying to get rid of a position.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="merge-shares-amount">
              Amount
            </label>
            <Input
              id="merge-shares-amount"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              placeholder="0.0"
              inputMode="decimal"
              className="h-12 text-base"
            />
            <div className="text-xs text-foreground/80">
              <span className="flex items-center gap-1">
                Available shares:
                <strong className="text-foreground">{formattedAvailableShares}</strong>
                <button
                  type="button"
                  className={cn(
                    'text-primary transition-colors',
                    Number(availableShares) > 0 ? 'hover:opacity-80' : 'cursor-not-allowed opacity-40',
                  )}
                  onClick={handleMaxClick}
                  disabled={!Number.isFinite(availableShares) || availableShares <= 0}
                >
                  Max
                </button>
              </span>
            </div>
          </div>

          <Button type="button" size="outcome" className="w-full text-base font-bold">
            Merge Shares
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
