import Image from 'next/image'
import { mockMarketDetails } from '@/lib/mockData'

export default function EventTopHolders() {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Yes Holders */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-emerald-600">
            Yes Holders
          </h3>
          <div className="space-y-3">
            {mockMarketDetails.holders.yes.map(holder => (
              <div key={holder.name} className="flex items-center gap-3">
                <Image
                  src={holder.avatar}
                  alt={holder.name}
                  width={32}
                  height={32}
                  className="flex-shrink-0 rounded-full"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {holder.name}
                  </div>
                  <div className="text-xs font-semibold text-emerald-600">
                    {holder.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No Holders */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-rose-600">
            No Holders
          </h3>
          <div className="space-y-3">
            {mockMarketDetails.holders.no.map(holder => (
              <div key={holder.name} className="flex items-center gap-3">
                <Image
                  src={holder.avatar}
                  alt={holder.name}
                  width={32}
                  height={32}
                  className="flex-shrink-0 rounded-full"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {holder.name}
                  </div>
                  <div className="text-xs font-semibold text-rose-600">
                    {holder.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
