'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Languages } from 'lucide-react'

interface Props {
  variant?: 'nav' | 'sidebar' | 'compact'
}

export default function LanguageSwitcher({ variant = 'nav' }: Props) {
  const locale  = useLocale()
  const t       = useTranslations('lang')
  const router  = useRouter()

  function toggle() {
    const next = locale === 'ar' ? 'en' : 'ar'
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`
    router.refresh()
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggle}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all hover:bg-[var(--surface-2)]"
        style={{ color: 'var(--text-secondary)' }}
        title={t('switch')}
      >
        <Languages size={16} />
        {t('switch')}
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
        style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
        title={t('switch')}
      >
        <Languages size={12} />
        {t('switch')}
      </button>
    )
  }

  // nav variant (default)
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--surface-2)]"
      style={{ color: 'var(--text-secondary)' }}
      title={t('switch')}
    >
      <Languages size={14} />
      {t('switch')}
    </button>
  )
}
