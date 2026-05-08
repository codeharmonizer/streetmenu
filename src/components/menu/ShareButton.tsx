'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareButton({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Native share sheet on mobile
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url })
        return
      } catch { /* user cancelled */ }
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
      style={{
        background: copied ? '#dcfce7' : 'var(--surface-2)',
        color: copied ? '#15803d' : 'var(--text-secondary)',
        border: '1px solid var(--border)',
      }}>
      {copied ? <Check size={13} /> : <Share2 size={13} />}
      {copied ? 'تم النسخ!' : 'مشاركة'}
    </button>
  )
}
