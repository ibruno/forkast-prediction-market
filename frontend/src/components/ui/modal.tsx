'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen)
    return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`
          mx-4 w-full min-w-[448px] max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl
          transition-[height] duration-200 ease-out
          ${className}
        `}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
