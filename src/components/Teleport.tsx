'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface TeleportProps {
  to: string
  children: ReactNode
}

export function Teleport({ to, children }: TeleportProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    function resolveContainer() {
      const target = document.querySelector(to) as HTMLElement | null
      setContainer(prev => (prev === target ? prev : target))
    }

    resolveContainer()

    const observer = new MutationObserver(resolveContainer)
    observer.observe(document.documentElement, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [to])

  if (!container) {
    return null
  }

  return createPortal(children, container)
}
