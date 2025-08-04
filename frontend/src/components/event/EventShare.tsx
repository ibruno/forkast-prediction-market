import { CheckIcon, ShareIcon } from 'lucide-react'
import { useState } from 'react'

export default function EventShare() {
  const [shareSuccess, setShareSuccess] = useState(false)

  async function handleShare() {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    }
    catch (error) {
      console.error('Error copying URL:', error)
    }
  }

  return shareSuccess
    ? <CheckIcon className="h-4 w-4 text-emerald-500" />
    : (
        <ShareIcon
          className="h-4 w-4 cursor-pointer transition-colors hover:text-foreground"
          onClick={handleShare}
        />
      )
}
