import Link from 'next/link'
import { QrCode, UtensilsCrossed, BarChart3, Smartphone, Star, Check } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

export default async function HomePage() {
  const t      = await getTranslations('landing')
  const tn     = await getTranslations('nav')
  const locale = await getLocale()

  const steps = [
    { n: locale === 'ar' ? '١' : '1', icon: UtensilsCrossed, title: t('step1Title'), desc: t('step1Desc') },
    { n: locale === 'ar' ? '٢' : '2', icon: QrCode,          title: t('step2Title'), desc: t('step2Desc') },
    { n: locale === 'ar' ? '٣' : '3', icon: Smartphone,      title: t('step3Title'), desc: t('step3Desc') },
  ]

  const features = [
    { icon: QrCode,          title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: Smartphone,      title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: BarChart3,       title: t('feature3Title'), desc: t('feature3Desc') },
    { icon: Star,            title: t('feature4Title'), desc: t('feature4Desc') },
    { icon: UtensilsCrossed, title: t('feature5Title'), desc: t('feature5Desc') },
    { icon: QrCode,          title: t('feature6Title'), desc: t('feature6Desc') },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{ borderColor: 'var(--border)', background: 'rgba(250,250,248,0.9)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <QrCode size={14} color="white" />
            </div>
            <span className="font-bold text-base" style={{ fontFamily: 'var(--font-display)' }}>StreetMenu</span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher variant="nav" />
            <Link href="/login"
              className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}>
              {tn('login')}
            </Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">
              {tn('register')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Text */}
          <div className="text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
              {t('badge')}
            </div>

            <h1 className="font-black mb-5"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.2rem, 6vw, 3.75rem)',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
              }}>
              {t('heroTitle')}{' '}
              <span style={{ color: 'var(--brand)' }}>{t('heroTitleHighlight')}</span>
            </h1>

            <p className="text-base sm:text-lg mb-8 max-w-md mx-auto lg:mx-0"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {t('heroDesc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/register" className="btn-primary text-base px-6 py-3">
                {t('ctaPrimary')}
              </Link>
              <Link href="/demo" className="btn-secondary text-base px-6 py-3">
                {t('ctaDemo')}
              </Link>
            </div>

            {/* Trust strip */}
            <div className="flex items-center justify-center lg:justify-start gap-5 mt-8 flex-wrap">
              {[t('trustNoCard'), t('trustSetup'), t('trustFree')].map(item => (
                <span key={item} className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--text-secondary)' }}>
                  <Check size={12} style={{ color: 'var(--brand)' }} strokeWidth={3} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-64 sm:w-72">
              <div className="rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: 'var(--surface)', border: '8px solid #1a1a1a' }}>
                <div className="h-6" style={{ background: '#1a1a1a' }} />
                <div className="p-4 space-y-3" style={{ background: 'var(--bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'var(--brand)' }}>بس</div>
                    <div>
                      <p className="font-bold text-xs" style={{ fontFamily: 'var(--font-display)' }}>بسطة أم خالد</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>مأكولات بحرينية 🇧🇭</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold" style={{ color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>مشويات</p>
                  {[
                    { name: 'مشاوي مشكلة', price: '٢.٥ د.ب', img: '🥩' },
                    { name: 'دجاج مشوي',   price: '١.٨ د.ب', img: '🍗' },
                    { name: 'حمص بالطحينة', price: '٠.٨ د.ب', img: '🫘' },
                  ].map(item => (
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-xl"
                      style={{ background: 'var(--surface-2)' }}>
                      <span className="text-xl">{item.img}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{item.name}</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--brand)' }}>{item.price}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-1 pt-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={10} fill="var(--brand)" style={{ color: 'var(--brand)' }} />)}
                    <span className="text-xs ms-1" style={{ color: 'var(--text-muted)' }}>٤.٩ (٣٢ تقييم)</span>
                  </div>
                </div>
              </div>
              {/* QR badge */}
              <div className="absolute -bottom-4 ltr:-left-4 rtl:-right-4 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'white', border: '2px solid var(--border)' }}>
                <QrCode size={32} style={{ color: 'var(--brand)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-12"
            style={{ fontFamily: 'var(--font-display)' }}>
            {t('stepsTitle')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="relative text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                  style={{ background: 'var(--brand-light)' }}>
                  <Icon size={22} style={{ color: 'var(--brand)' }} />
                </div>
                <div className="absolute top-0 ltr:left-0 rtl:right-0 text-6xl font-black select-none pointer-events-none"
                  style={{ color: 'var(--brand)', opacity: 0.06, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {n}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-10"
          style={{ fontFamily: 'var(--font-display)' }}>
          {t('featuresTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 p-4 rounded-2xl items-start"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'var(--brand-light)' }}>
                <Icon size={16} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <p className="font-bold text-sm mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>{title}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            {t('pricingTitle')}
          </h2>
          <p className="text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
            {t('pricingDesc')}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl p-6 text-start" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{t('freePlanName')}</p>
              <p className="text-4xl font-black mb-1" style={{ fontFamily: 'var(--font-display)' }}>{t('freePlanPrice')}</p>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>{t('freePlanPeriod')}</p>
              <ul className="space-y-2.5 text-sm mb-6">
                {[t('freeFeature1'), t('freeFeature2'), t('freeFeature3'), t('freeFeature4')].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#16a34a' }} strokeWidth={3} className="flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary w-full py-2.5 text-sm">
                {t('freeCta')}
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-6 text-start relative overflow-hidden"
              style={{ background: 'var(--brand)', border: '1px solid var(--brand-dark)' }}>
              <div className="absolute top-3 ltr:right-3 rtl:left-3 text-xs font-bold px-2 py-0.5 rounded-full bg-white"
                style={{ color: 'var(--brand)' }}>
                {t('proPlanBadge')}
              </div>
              <p className="font-bold text-sm mb-1 text-white opacity-80">{t('proPlanName')}</p>
              <p className="text-4xl font-black mb-1 text-white" style={{ fontFamily: 'var(--font-display)' }}>{t('proPlanPrice')}</p>
              <p className="text-xs mb-5 text-white opacity-60">{t('proPlanPeriod')}</p>
              <ul className="space-y-2.5 text-sm mb-6 text-white">
                {[t('proFeature1'), t('proFeature2'), t('proFeature3'), t('proFeature4')].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} color="white" strokeWidth={3} className="flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="w-full py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center transition-all"
                style={{ background: 'white', color: 'var(--brand)' }}>
                {t('proCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="rounded-3xl p-8 sm:p-14 text-center"
          style={{ background: 'var(--brand)' }}>
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3"
            style={{ fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
            {t('ctaBannerTitle')}
          </h2>
          <p className="text-base text-white mb-8" style={{ opacity: 0.85 }}>
            {t('ctaBannerDesc')}
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-xl text-sm transition-all hover:-translate-y-0.5"
            style={{ background: 'white', color: 'var(--brand)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            {t('ctaBannerBtn')}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
          style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <QrCode size={12} color="white" />
            </div>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>StreetMenu</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:underline" style={{ color: 'var(--brand)' }}>{t('footerContact')}</Link>
            <span>•</span>
            <span>{t('footerCopyright')}</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
