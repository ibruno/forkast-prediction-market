import { OUTCOME_INDEX } from '@/lib/constants'
import { sharesFormatter } from '@/lib/formatters'

type ActiveOutcome = typeof OUTCOME_INDEX.YES | typeof OUTCOME_INDEX.NO | undefined

interface EventOrderPanelUserSharesProps {
  yesShares: number
  noShares: number
  activeOutcome?: ActiveOutcome
}

export default function EventOrderPanelUserShares({ yesShares, noShares, activeOutcome }: EventOrderPanelUserSharesProps) {
  const formattedYesShares = sharesFormatter.format(Math.max(0, yesShares))
  const formattedNoShares = sharesFormatter.format(Math.max(0, noShares))
  const yesClass = activeOutcome === OUTCOME_INDEX.YES ? 'text-yes' : 'text-muted-foreground'
  const noClass = activeOutcome === OUTCOME_INDEX.NO ? 'text-no' : 'text-muted-foreground'

  return (
    <div className="mb-4 flex gap-2">
      <div className="flex-1 text-center">
        <span className={`text-xs font-semibold ${yesClass}`}>
          {formattedYesShares}
          {' '}
          shares
        </span>
      </div>
      <div className="flex-1 text-center">
        <span className={`text-xs font-semibold ${noClass}`}>
          {formattedNoShares}
          {' '}
          shares
        </span>
      </div>
    </div>
  )
}
