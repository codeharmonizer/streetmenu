'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ShareButton({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('publicMenu')

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url })
        return
      } catch { /* user cancelled */ }
    }
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
        color:      copied ? '#15803d' : 'var(--text-secondary)',
        border:     '1px solid var(--border)',
      }}>
      {copied ? <Check size={13} /> : <Share2 size={13} />}
      {copied ? t('copySuccess') : t('shareBtn')}
    </button>
  )
}
