import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import ScanBiteLogo from '@/components/shared/ScanBiteLogo'

/* ─────────────────────────────────────────────
   Inline SVG helpers (brand-kit originals)
───────────────────────────────────────────── */
function CheckSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l3.5 3.5L12 3" stroke="#E84B1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowSvg({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default async function HomePage() {
  const t      = await getTranslations('landing')
  const tn     = await getTranslations('nav')
  const locale = await getLocale()
  const isAr   = locale === 'ar'

  const C = {
    charcoal:  '#1A1A1A',
    charcoal2: '#242424',
    charcoal3: '#2E2E2E',
    red:       '#E84B1A',
    redDark:   '#C23A10',
    cream:     '#F5F0E8',
    cream2:    '#EDE8DF',
    white:     '#FFFFFF',
    gray:      '#888880',
    grayLight: '#BFBDB5',
  }

  const vendors = [
    'Basta Umm Khalid', 'Mashawi Al Noor', 'Café Zafran',
    'Gulf Grill House', 'Al Waha Kitchen', 'Burger District',
    'Saffron Bistro', 'Kabab Street',
  ]

  const testimonials = [
    {
      quote: isAr
        ? '"أعددته في 10 دقائق بين وجبتي الغداء. الآن الزبائن يمسحون وأخطاء طلباتي انخفضت النصف."'
        : '"Set it up in 10 minutes between the lunch rush. Now customers just scan and my order mistakes dropped by half."',
      name: isAr ? 'أبو خالد' : 'Abu Khalid',
      role: isAr ? 'صاحب بسطة، المنامة' : 'Basta owner, Manama',
      initials: 'AK',
    },
    {
      quote: isAr
        ? '"قائمتي تبدو أكثر احترافية من مطاعم أضعاف حجمي. الزبائن يثقون بمطعم يمكنهم قراءة عنه قبل الجلوس."'
        : '"My menu looks more professional than restaurants 10x my size. Customers trust a restaurant they can read about before they sit."',
      name: isAr ? 'سارة ح.' : 'Sara H.',
      role: isAr ? 'صاحبة كافيه، الرفاع' : 'Café owner, Riffa',
      initials: 'SH',
    },
    {
      quote: isAr
        ? '"غيّرت أسعاري في يوم جمعة مزدحم. استغرق 30 ثانية. القوائم المطبوعة كانت ستكلفني 3 أيام و40 ديناراً."'
        : '"I updated my prices during a busy Friday. Took 30 seconds. Printed menus would\'ve cost me 3 days and 40 dinars."',
      name: isAr ? 'محمد ن.' : 'Mohammed N.',
      role: isAr ? 'مطعم مشاوي، المحرق' : 'Mashawi restaurant, Muharraq',
      initials: 'MN',
    },
  ]

  return (
    <div style={{ background: C.charcoal, color: C.white, fontFamily: "'DM Sans','Cairo',sans-serif", overflowX: 'hidden' }}>

      {/* ══════════════ NAV ══════════════ */}
      <nav className="sb-nav" style={{
        position: 'fixed', top: 0, insetInline: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        background: 'rgba(26,26,26,0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <ScanBiteLogo size={30} />
          <span style={{ fontWeight: 700, fontSize: 18, color: C.white, letterSpacing: '-0.3px' }}>
            Scan<span style={{ color: C.red }}>Bite</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitcher variant="nav" />
          <Link href="/login" className="sb-nav-login"
            style={{ fontSize: 14, color: C.grayLight, textDecoration: 'none', fontWeight: 400, padding: '8px 12px' }}>
            {tn('login')}
          </Link>
          <Link href="/register"
            style={{
              background: C.red, color: C.white, fontSize: 14, fontWeight: 600,
              padding: '9px 22px', borderRadius: 8, textDecoration: 'none',
            }}>
            {tn('register')}
          </Link>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ minHeight: '100vh', paddingTop: 88, position: 'relative', overflow: 'hidden' }}>
        {/* Grid background — full-width */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Red glow — full-width */}
        <div style={{
          position: 'absolute', top: -200, insetInlineStart: -200,
          width: 600, height: 600, pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(232,75,26,0.15) 0%, transparent 70%)',
        }} />

        {/* Content constrained to 1280px */}
        <div className="sb-hero-grid" style={{
          maxWidth: 1280, margin: '0 auto',
          minHeight: 'calc(100vh - 88px)',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          position: 'relative', zIndex: 2,
        }}>

        {/* Left — text */}
        <div className="sb-hero-text" style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 48px 80px 48px',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,75,26,0.12)', border: '0.5px solid rgba(232,75,26,0.3)',
            borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500,
            color: '#FF6B35', letterSpacing: '0.04em', marginBottom: 32, width: 'fit-content',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, display: 'inline-block' }} />
            {t('heroBadge')}
          </div>

          {/* Headline — Bebas Neue for EN, Cairo for AR */}
          <h1 style={{
            fontFamily: isAr ? "'Cairo', sans-serif" : "'Bebas Neue', sans-serif",
            fontSize: 'clamp(64px, 8vw, 108px)',
            lineHeight: 0.95,
            letterSpacing: isAr ? 0 : '0.01em',
            color: C.white,
            marginBottom: 8,
            fontWeight: isAr ? 900 : 400,
          }}>
            {t('heroLine1')}<br />
            {t('heroLine2')}<br />
            <span style={{ color: C.red }}>{t('heroLine3')}</span>
          </h1>

          <p style={{
            fontSize: 18, fontWeight: 300, color: C.grayLight,
            lineHeight: 1.65, maxWidth: 460, margin: '28px 0 44px',
          }}>
            {t('heroSubline')}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.red, color: C.white, fontSize: 15, fontWeight: 600,
              padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
            }}>
              {t('ctaPrimary')} <ArrowSvg />
            </Link>
            <Link href="/demo" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: C.white, fontSize: 15,
              padding: '14px 24px', borderRadius: 10, textDecoration: 'none',
              border: '0.5px solid rgba(255,255,255,0.2)',
            }}>
              {t('ctaDemo')}
            </Link>
          </div>

          {/* Trust */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 48, flexWrap: 'wrap' }}>
            {[t('trustNoCard'), t('trustSetup'), t('trustFree')].map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: C.gray }}>
                <CheckSvg /> {item}
              </span>
            ))}
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="sb-hero-phone" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '80px 48px 80px 32px',
        }}>
          <div style={{ position: 'relative' }}>
            {/* Floating badge 1 */}
            <div style={{
              position: 'absolute', top: 40, insetInlineEnd: -24,
              background: C.charcoal2, border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
              backdropFilter: 'blur(8px)', zIndex: 10,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,75,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2l1.8 3.6L15 6.3l-3 2.9.7 4.1L9 11.4l-3.7 1.9.7-4.1L3 6.3l4.2-.7L9 2z" fill="#E84B1A" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.white }}>4.9 rating</div>
                <div style={{ fontSize: 11, color: C.gray, marginTop: 1 }}>32 reviews today</div>
              </div>
            </div>

            {/* Floating badge 2 */}
            <div style={{
              position: 'absolute', bottom: 80, insetInlineStart: -32,
              background: C.charcoal2, border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
              backdropFilter: 'blur(8px)', zIndex: 10,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,75,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9a6 6 0 1012 0A6 6 0 003 9zm6-3v3l2 2" stroke="#E84B1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.white }}>128 scans</div>
                <div style={{ fontSize: 11, color: C.gray, marginTop: 1 }}>Last 24 hours</div>
              </div>
            </div>

            {/* Phone */}
            <div style={{ width: 260, background: '#111', borderRadius: 40, padding: 12, border: '1.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ background: C.cream, borderRadius: 30, overflow: 'hidden' }}>
                <div style={{ width: 80, height: 24, background: '#111', borderRadius: '0 0 14px 14px', margin: '0 auto' }} />
                {/* Header */}
                <div style={{ background: '#1A1A1A', padding: '14px 16px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.white, fontFamily: "'DM Sans',sans-serif" }}>Mashawi Al Noor</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'DM Sans',sans-serif" }}>
                    <span style={{ background: C.red, color: C.white, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4 }}>4.8</span>
                    <span>Grills · Manama</span>
                  </div>
                </div>
                {/* Categories */}
                <div style={{ display: 'flex', gap: 6, padding: '10px 14px 8px', background: C.cream }}>
                  {['All', 'Grills', 'Mezze', 'Drinks'].map((cat, i) => (
                    <div key={cat} style={{
                      fontSize: 10, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
                      background: i === 0 ? C.red : C.white,
                      color: i === 0 ? C.white : '#555',
                      border: i === 0 ? 'none' : '0.5px solid #ddd',
                      fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap',
                    }}>{cat}</div>
                  ))}
                </div>
                {/* Items */}
                <div style={{ padding: '0 14px 14px', background: C.cream }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1A1A1A', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '10px 0 7px', fontFamily: "'DM Sans',sans-serif" }}>Grills</div>
                  {[
                    { name: 'Mashawi mix platter', desc: 'Lamb kofta, chicken tikka', price: '3.800 BD', emoji: '🥩', popular: true },
                    { name: 'Lamb chops', desc: 'Marinated overnight', price: '4.500 BD', emoji: '🍖', popular: false },
                  ].map(item => (
                    <div key={item.name} style={{ background: C.white, borderRadius: 10, padding: 10, marginBottom: 6, display: 'flex', gap: 8, alignItems: 'center', border: '0.5px solid #E8E4DC' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: '#FFF0EB' }}>{item.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {item.popular && <div style={{ background: '#FFF0EB', color: '#993C1D', fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4, display: 'inline-block', marginBottom: 2, fontFamily: "'DM Sans',sans-serif" }}>Popular</div>}
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', fontFamily: "'DM Sans',sans-serif" }}>{item.name}</div>
                        <div style={{ fontSize: 9, color: '#888', marginTop: 1, fontFamily: "'DM Sans',sans-serif" }}>{item.desc}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.red, fontFamily: "'DM Sans',sans-serif" }}>{item.price}</div>
                          <div style={{ width: 22, height: 22, background: C.red, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Cart bar */}
                <div style={{ background: C.red, margin: '0 14px 12px', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'DM Sans',sans-serif" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.white }}>View cart</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: C.white, fontSize: 11, fontWeight: 500 }}>3.800 BD</span>
                    <div style={{ background: C.white, color: C.red, fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow under phone */}
            <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 180, height: 40, background: 'rgba(232,75,26,0.3)', filter: 'blur(20px)', borderRadius: '50%' }} />
          </div>
        </div>

        </div>{/* /content max-width wrapper */}
      </section>

      {/* ══════════════ LOGOS STRIP ══════════════ */}
      <div style={{ background: C.charcoal2, borderTop: '0.5px solid rgba(255,255,255,0.06)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '28px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 56, alignItems: 'center', animation: 'scroll 24s linear infinite', width: 'max-content' }}>
          {[...vendors, ...vendors].map((v, i) => (
            <span key={i} style={{ fontFamily: "'DM Sans','Cairo',sans-serif", fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.22)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
              {i % 2 === 1 ? '·' : v}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          @media (max-width: 767px) {
            .sb-nav { padding: 12px 16px !important; }
            .sb-nav-login { display: none !important; }
            .sb-hero-grid { grid-template-columns: 1fr !important; }
            .sb-hero-phone { display: none !important; }
            .sb-hero-text { padding: 40px 20px 60px !important; }
            .sb-inner { padding-left: 20px !important; padding-right: 20px !important; }
            .sb-steps-grid { grid-template-columns: 1fr !important; }
            .sb-steps-grid > div { border-right: none !important; border-bottom: 0.5px solid rgba(255,255,255,0.06); }
            .sb-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .sb-stats-grid > div:nth-child(2) { border-right: none !important; }
            .sb-stats-grid > div:nth-child(3), .sb-stats-grid > div:nth-child(4) { border-top: 0.5px solid rgba(255,255,255,0.06); }
            .sb-features-grid { grid-template-columns: 1fr !important; }
            .sb-feature-wide { grid-column: span 1 !important; flex-direction: column !important; align-items: flex-start !important; }
            .sb-pricing-grid { grid-template-columns: 1fr !important; max-width: 100% !important; }
            .sb-testi-grid { grid-template-columns: 1fr !important; }
            .sb-cta-watermark { display: none !important; }
            .sb-footer-top { flex-direction: column !important; gap: 28px !important; }
          }
        `}</style>
      </div>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="sb-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 48px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              <span style={{ width: 20, height: 1, background: C.red, display: 'inline-block' }} />
              {t('sectionHow')}
            </div>
            <h2 style={{ fontFamily: isAr ? "'Cairo',sans-serif" : "'Bebas Neue',sans-serif", fontSize: 'clamp(48px, 5vw, 72px)', lineHeight: 0.95, color: C.white, marginBottom: 20, fontWeight: isAr ? 900 : 400 }}>
              {t('howHeadline1')}<br /><span style={{ color: C.red }}>{t('howHeadline2')}</span>
            </h2>
            <p style={{ fontSize: 17, fontWeight: 300, color: C.grayLight, lineHeight: 1.65, maxWidth: 540 }}>
              {t('howSubtitle')}
            </p>
          </div>

          {/* 3-step grid */}
          <div className="sb-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginTop: 64, border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
            {[
              { num: '01', title: t('step1Title'), desc: t('step1Desc') },
              { num: '02', title: t('step2Title'), desc: t('step2Desc') },
              { num: '03', title: t('step3Title'), desc: t('step3Desc') },
            ].map((step, i) => (
              <div key={step.num} style={{ background: C.charcoal2, padding: '48px 40px', position: 'relative', borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 80, color: 'rgba(255,255,255,0.04)', lineHeight: 1, position: 'absolute', top: 20, insetInlineEnd: 32 }}>{step.num}</div>
                <div style={{ width: 48, height: 48, background: 'rgba(232,75,26,0.12)', border: '0.5px solid rgba(232,75,26,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    {i === 0 && <><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#E84B1A" strokeWidth="1.5"/><rect x="12" y="3" width="7" height="7" rx="1.5" stroke="#E84B1A" strokeWidth="1.5"/><rect x="3" y="12" width="7" height="7" rx="1.5" stroke="#E84B1A" strokeWidth="1.5"/><path d="M12 15.5h7M15.5 12v7" stroke="#E84B1A" strokeWidth="1.5" strokeLinecap="round"/></>}
                    {i === 1 && <><path d="M4 4h4v4H4zM14 4h4v4h-4zM4 14h4v4H4z" stroke="#E84B1A" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 6v0M16 6v0M6 16v0" stroke="#E84B1A" strokeWidth="2" strokeLinecap="round"/><path d="M14 14h2v2h-2zM16 16h2v2h-2zM14 16v2" stroke="#E84B1A" strokeWidth="1.5" strokeLinejoin="round"/></>}
                    {i === 2 && <><path d="M11 3C7 3 3.5 6.5 3.5 11S7 19 11 19s7.5-3.5 7.5-8-3.5-8-7.5-8z" stroke="#E84B1A" strokeWidth="1.5"/><path d="M8 11l2 2 4-4" stroke="#E84B1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>}
                  </svg>
                </div>
                <div style={{ fontFamily: "'DM Sans','Cairo',sans-serif", fontSize: 20, fontWeight: 600, color: C.white, marginBottom: 12 }}>{step.title}</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: C.grayLight, lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="sb-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 80, border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            {[
              { n: '2', suffix: 'K+', label: t('statMenus') },
              { n: '50', suffix: 'K+', label: t('statScans') },
              { n: '4.9', suffix: '★', label: t('statRating') },
              { n: '5', suffix: isAr ? 'د' : 'min', label: t('statSetup') },
            ].map((s, i) => (
              <div key={i} style={{ padding: '36px 32px', borderRight: i < 3 ? '0.5px solid rgba(255,255,255,0.06)' : 'none', background: C.charcoal2 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: C.white, lineHeight: 1, marginBottom: 6 }}>
                  {s.n}<span style={{ color: C.red }}>{s.suffix}</span>
                </div>
                <div style={{ fontSize: 13, color: C.gray, fontWeight: 300 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES (cream bg) ══════════════ */}
      <section style={{ background: C.cream, padding: '100px 0' }}>
        <div className="sb-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.red, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              <span style={{ width: 20, height: 1, background: C.red, display: 'inline-block' }} />
              {t('sectionFeatures')}
            </div>
            <h2 style={{ fontFamily: isAr ? "'Cairo',sans-serif" : "'Bebas Neue',sans-serif", fontSize: 'clamp(48px, 5vw, 72px)', lineHeight: 0.95, color: C.charcoal, marginBottom: 20, fontWeight: isAr ? 900 : 400 }}>
              {t('featuresHeadline1')}<br /><span style={{ color: C.red }}>{t('featuresHeadline2')}</span>
            </h2>
            <p style={{ fontSize: 17, fontWeight: 300, color: '#666', lineHeight: 1.65, maxWidth: 540 }}>{t('featuresSubtitle')}</p>
          </div>

          <div className="sb-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {/* Large QR card */}
            <div className="sb-feature-wide" style={{ gridColumn: 'span 2', background: C.white, borderRadius: 16, padding: '32px 28px', border: '0.5px solid rgba(0,0,0,0.07)', display: 'flex', gap: 32, alignItems: 'center' }}>
              <div>
                <div style={{ width: 44, height: 44, background: '#FFF0EB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#E84B1A" strokeWidth="1.5"/><rect x="12" y="3" width="7" height="7" rx="1.5" stroke="#E84B1A" strokeWidth="1.5"/><rect x="3" y="12" width="7" height="7" rx="1.5" stroke="#E84B1A" strokeWidth="1.5"/><rect x="12" y="12" width="7" height="7" rx="1.5" stroke="#E84B1A" strokeWidth="1.5"/></svg>
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: C.charcoal, marginBottom: 8 }}>{t('feature1Title')}</div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, fontWeight: 300 }}>{t('feature1Desc')}</div>
              </div>
              <div style={{ background: C.cream, borderRadius: 16, padding: 24, minWidth: 140, textAlign: 'center', flexShrink: 0 }}>
                <svg width="100" height="100" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
                  <rect width="140" height="140" fill="#FFFFFF" rx="8"/>
                  <rect x="8" y="8" width="40" height="40" rx="4" fill="#1A1A1A"/><rect x="14" y="14" width="28" height="28" rx="2" fill="#FFFFFF"/><rect x="18" y="18" width="16" height="16" rx="1" fill="#1A1A1A"/>
                  <rect x="92" y="8" width="40" height="40" rx="4" fill="#1A1A1A"/><rect x="98" y="14" width="28" height="28" rx="2" fill="#FFFFFF"/><rect x="102" y="18" width="16" height="16" rx="1" fill="#1A1A1A"/>
                  <rect x="8" y="92" width="40" height="40" rx="4" fill="#1A1A1A"/><rect x="14" y="98" width="28" height="28" rx="2" fill="#FFFFFF"/><rect x="18" y="102" width="16" height="16" rx="1" fill="#1A1A1A"/>
                  <rect x="56" y="56" width="8" height="8" rx="1" fill="#E84B1A"/><rect x="68" y="56" width="8" height="8" rx="1" fill="#E84B1A"/><rect x="80" y="56" width="8" height="8" rx="1" fill="#E84B1A"/>
                  <rect x="56" y="8" width="8" height="8" rx="1" fill="#1A1A1A"/><rect x="68" y="8" width="8" height="8" rx="1" fill="#1A1A1A"/>
                  <rect x="8" y="56" width="8" height="8" rx="1" fill="#1A1A1A"/><rect x="20" y="56" width="8" height="8" rx="1" fill="#1A1A1A"/>
                  <rect x="56" y="68" width="8" height="8" rx="1" fill="#1A1A1A"/><rect x="56" y="80" width="8" height="8" rx="1" fill="#1A1A1A"/>
                  <rect x="92" y="56" width="8" height="8" rx="1" fill="#1A1A1A"/><rect x="104" y="56" width="8" height="8" rx="1" fill="#1A1A1A"/>
                </svg>
                <div style={{ fontSize: 11, color: '#888', marginTop: 8, fontFamily: "'DM Sans',sans-serif" }}>{t('yourCode')}</div>
              </div>
            </div>

            {/* Small feature cards — 4 cards so large(span2)+f1 = row1, f2+f3+f4 = row2, no orphan */}
            {[
              { title: t('feature2Title'), desc: t('feature2Desc'), icon: <path d="M3 17V5a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#E84B1A" strokeWidth="1.5"/> },
              { title: t('feature3Title'), desc: t('feature3Desc'), icon: <><path d="M3 17l4-4 3 3 4-5 4 5" stroke="#E84B1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="3" width="16" height="16" rx="2" stroke="#E84B1A" strokeWidth="1.5"/></> },
              { title: t('feature4Title'), desc: t('feature4Desc'), icon: <path d="M11 2l2.2 4.4 4.8.7-3.5 3.4.8 4.8L11 13l-4.3 2.3.8-4.8L4 7.1l4.8-.7L11 2z" stroke="#E84B1A" strokeWidth="1.5" strokeLinejoin="round"/> },
              { title: t('feature5Title'), desc: t('feature5Desc'), icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#E84B1A" strokeWidth="1.5"/><path d="M12 15.5h7M15.5 12v7" stroke="#E84B1A" strokeWidth="1.5" strokeLinecap="round"/></> },
            ].map((f, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 16, padding: '32px 28px', border: '0.5px solid rgba(0,0,0,0.07)' }}>
                <div style={{ width: 44, height: 44, background: '#FFF0EB', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">{f.icon}</svg>
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: C.charcoal, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PRICING ══════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="sb-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 48px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, justifyContent: 'center' }}>
            <span style={{ width: 20, height: 1, background: C.red, display: 'inline-block' }} />
            {t('sectionPricing')}
          </div>
          <h2 style={{ fontFamily: isAr ? "'Cairo',sans-serif" : "'Bebas Neue',sans-serif", fontSize: 'clamp(48px, 5vw, 72px)', lineHeight: 0.95, color: C.white, marginBottom: 20, fontWeight: isAr ? 900 : 400 }}>
            {t('pricingHeadline1')}<br /><span style={{ color: C.red }}>{t('pricingHeadline2')}</span>
          </h2>
          <p style={{ fontSize: 17, fontWeight: 300, color: C.grayLight, marginBottom: 56 }}>{t('pricingSubtitle')}</p>

          <div className="sb-pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 720, margin: '0 auto' }}>
            {/* Free */}
            <div style={{ background: C.charcoal2, border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 36px', textAlign: 'start' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.gray, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{t('freePlanName')}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: C.white, lineHeight: 1, marginBottom: 4 }}>
                0<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 300, color: C.gray }}> BD</span>
              </div>
              <div style={{ fontSize: 13, color: C.gray, marginBottom: 32 }}>{t('freePlanPeriod')}</div>
              <ul style={{ listStyle: 'none', marginBottom: 36 }}>
                {[t('freeFeature1'), t('freeFeature2'), t('freeFeature3'), t('freeFeature4')].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.grayLight, padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)', fontWeight: 300 }}>
                    <span style={{ width: 18, height: 18, background: 'rgba(232,75,26,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#E84B1A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', color: C.white, fontSize: 15, padding: '14px 24px', borderRadius: 10, textDecoration: 'none', border: '0.5px solid rgba(255,255,255,0.2)' }}>
                {t('freeCta')}
              </Link>
            </div>

            {/* Pro */}
            <div style={{ background: C.charcoal3, border: `1px solid ${C.red}`, borderRadius: 20, padding: '40px 36px', textAlign: 'start', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 20, insetInlineEnd: 20, background: C.red, color: C.white, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.03em' }}>
                {t('proPlanBadge')}
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: C.gray, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>{t('proPlanName')}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: C.white, lineHeight: 1, marginBottom: 4 }}>
                30<span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 18, fontWeight: 300, color: C.gray }}> BD / yr</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,75,26,0.15)', color: '#FF6B35', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 999, marginBottom: 14 }}>
                {t('proYearlySavings')}
              </div>
              <div style={{ fontSize: 13, color: C.gray, marginBottom: 6 }}>{t('proMonthlyFallback')}</div>
              <div style={{ fontSize: 13, color: C.gray, marginBottom: 32 }}>{t('proEverything')}</div>
              <ul style={{ listStyle: 'none', marginBottom: 36 }}>
                {[t('proFeature1'), t('proFeature2'), t('proFeature3'), t('proFeature4')].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.grayLight, padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)', fontWeight: 300 }}>
                    <span style={{ width: 18, height: 18, background: 'rgba(232,75,26,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#E84B1A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: C.red, color: C.white, fontSize: 15, fontWeight: 600, padding: '14px 28px', borderRadius: 10, textDecoration: 'none' }}>
                {t('proCta')} <ArrowSvg />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section style={{ background: C.charcoal2, padding: '100px 0' }}>
        <div className="sb-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#FF6B35', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            <span style={{ width: 20, height: 1, background: C.red, display: 'inline-block' }} />
            {t('sectionTestimonials')}
          </div>
          <h2 style={{ fontFamily: isAr ? "'Cairo',sans-serif" : "'Bebas Neue',sans-serif", fontSize: 'clamp(48px, 5vw, 72px)', lineHeight: 0.95, color: C.white, marginBottom: 56, fontWeight: isAr ? 900 : 400 }}>
            {t('testimonialsHeadline1')}<br /><span style={{ color: C.red }}>{t('testimonialsHeadline2')}</span>
          </h2>
          <div className="sb-testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {testimonials.map((tm, i) => (
              <div key={i} style={{ background: C.charcoal3, border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: C.red, fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, fontWeight: 300, color: C.grayLight, lineHeight: 1.65, marginBottom: 20 }}>{tm.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(232,75,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#FF6B35' }}>
                    {tm.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{tm.name}</div>
                    <div style={{ fontSize: 12, color: C.gray, marginTop: 1 }}>{tm.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <div style={{ background: C.red, padding: '100px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="sb-cta-watermark" style={{ position: 'absolute', fontFamily: "'Bebas Neue',sans-serif", fontSize: 240, color: 'rgba(255,255,255,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '0.1em' }}>
          SCANBITE
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: isAr ? "'Cairo',sans-serif" : "'Bebas Neue',sans-serif", fontSize: 'clamp(56px, 7vw, 96px)', color: C.white, lineHeight: 0.95, marginBottom: 24, fontWeight: isAr ? 900 : 400 }}>
            {t('ctaHeadline1')}<br />{t('ctaHeadline2')}
          </h2>
          <p style={{ fontSize: 18, fontWeight: 300, color: 'rgba(255,255,255,0.8)', marginBottom: 44 }}>{t('ctaBannerDesc')}</p>
          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.white, color: C.red, fontSize: 15, fontWeight: 700,
            padding: '16px 36px', borderRadius: 10, textDecoration: 'none',
          }}>
            {t('ctaBannerBtn')} <ArrowSvg color={C.red} />
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 20 }}>{t('ctaNote')}</p>
        </div>
      </div>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ background: '#111', padding: '56px 0 36px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div className="sb-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 48px' }}>
          <div className="sb-footer-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ScanBiteLogo size={24} />
                Scan<span style={{ color: C.red }}>Bite</span>
              </div>
              <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.6, fontWeight: 300 }}>{t('footerTagline')}</p>
            </div>
            {[
              { head: isAr ? 'المنتج' : 'Product', links: [t('sectionHow'), t('sectionFeatures'), t('sectionPricing')] },
              { head: isAr ? 'تواصل' : 'Company',  links: [t('footerContact'), t('footerCopyright')] },
            ].map(col => (
              <div key={col.head}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: C.white, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>{col.head}</h4>
                {col.links.map(l => (
                  <Link key={l} href="/contact" style={{ display: 'block', fontSize: 13, color: C.gray, textDecoration: 'none', marginBottom: 9, fontWeight: 300 }}>{l}</Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', marginTop: 48, paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: C.gray, fontWeight: 300 }}>{t('footerCopyright')}. All rights reserved.</p>
            <p style={{ fontSize: 12, color: C.gray, fontWeight: 300 }}>Made with love for food people everywhere.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
