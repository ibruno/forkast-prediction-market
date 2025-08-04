'use client'

import { ProgressProvider } from '@bprogress/next/app'

function ProgressIndicator({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="2px"
      color="#00a4e8"
      options={{ showSpinner: true }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  )
}

export default ProgressIndicator
