import FlyerQR from '@/components/flyer/FlyerQR'
import PrintButton from './PrintButton'

const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://scanbite-menu.vercel.app'
const REGISTER_URL = `${APP_URL}/register`

const AR_FEATURES = [
  'مجاني للبدء — بدون بطاقة ائتمان',
  'رمز QR جاهز فوراً للطباعة',
  'تقييمات الزبائن تبني سمعتك',
  'استقبل طلبات الزبائن مباشرة',
]
const EN_FEATURES = [
  'Free to start — no credit card',
  'QR code ready instantly to print',
  'Customer reviews build your reputation',
  'Online ordering with live tracking',
]

export default function FlyerPage() {
  return (
    <>
      {/* ── Screen controls (hidden when printing) ── */}
      <div className="no-print screen-controls">
        <div style={{ textAlign: 'center', padding: '24px 16px 8px', background: '#1A1A1A' }}>
          <p style={{ fontSize: 13, color: '#888880', marginBottom: 12 }}>
            اضغط &quot;طباعة&quot; لتصدير الفلاير كـ PDF أو طباعته مباشرة
            &nbsp;·&nbsp;
            Press &quot;Print&quot; to export as PDF or print directly
          </p>
          <PrintButton />
        </div>
      </div>

      {/* ── Flyer ── */}
      <div className="flyer-page" id="flyer">

        {/* ━━━ HEADER ━━━ */}
        <div className="flyer-header">
          {/* dot-grid overlay */}
          <div className="flyer-grid-bg" />
          {/* red glow */}
          <div className="flyer-glow" />

          <div className="flyer-header-inner">
            {/* Logo row */}
            <div className="flyer-logo-row">
              {/* QR-pattern SVG from brand kit */}
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="7" fill="#E84B1A" fillOpacity="0.18"/>
                <rect x="7" y="7" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="8.5" y="8.5" width="4" height="4" rx="0.5" fill="#E84B1A"/>
                <rect x="18" y="7" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="19.5" y="8.5" width="4" height="4" rx="0.5" fill="#E84B1A"/>
                <rect x="7" y="18" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="8.5" y="19.5" width="4" height="4" rx="0.5" fill="#E84B1A"/>
                <rect x="18" y="18" width="3" height="3" rx="0.5" fill="white"/>
                <rect x="23" y="18" width="2" height="2" rx="0.5" fill="white"/>
                <rect x="18" y="23" width="2" height="2" rx="0.5" fill="white"/>
                <rect x="22" y="22" width="3" height="3" rx="0.5" fill="white"/>
              </svg>
              <span className="flyer-brand">
                Scan<span className="flyer-brand-accent">Bite</span>
              </span>
            </div>

            {/* Headline */}
            <p className="flyer-headline-ar">امسح. شاهد. كُل.</p>
            <p className="flyer-headline-en">SCAN IT. SEE IT. EAT IT.</p>
            <p className="flyer-sub">قوائم رقمية وطلبات أونلاين &nbsp;·&nbsp; Digital menus &amp; online ordering</p>
          </div>
        </div>

        {/* ━━━ BODY ━━━ */}
        <div className="flyer-body">

          {/* ── Arabic section ── */}
          <div className="flyer-section ar-section" dir="rtl">
            <div className="flyer-section-label">للأعمال الغذائية</div>
            <p className="flyer-h1">هل لديك مطعم أو بسطة أو مشروع طعام؟</p>
            <p className="flyer-h2">حوّل قائمتك رقمياً في <strong>5 دقائق!</strong></p>
            <ul className="flyer-features">
              {AR_FEATURES.map(f => (
                <li key={f}>
                  <span className="check">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Divider ── */}
          <div className="flyer-divider">
            <div className="divider-line" />
            <div className="divider-badge">AR · EN</div>
            <div className="divider-line" />
          </div>

          {/* ── English section ── */}
          <div className="flyer-section en-section" dir="ltr">
            <div className="flyer-section-label">For food businesses</div>
            <p className="flyer-h1">Restaurant, stall, or food business?</p>
            <p className="flyer-h2">Go digital in <strong>5 minutes!</strong></p>
            <ul className="flyer-features">
              {EN_FEATURES.map(f => (
                <li key={f}>
                  <span className="check">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* ━━━ QR SECTION ━━━ */}
          <div className="flyer-qr-section">
            <div className="flyer-qr-card">
              <div className="qr-wrapper">
                <FlyerQR url={REGISTER_URL} />
              </div>
              <div className="qr-labels">
                <p className="qr-cta-ar">امسح للتسجيل مجاناً</p>
                <p className="qr-url">{APP_URL.replace('https://', '')}</p>
                <p className="qr-cta-en">Scan to register for free</p>
              </div>
            </div>
          </div>

        </div>

        {/* ━━━ FOOTER ━━━ */}
        <div className="flyer-footer">
          <span>Scan<span style={{ color: '#E84B1A' }}>Bite</span></span>
          <span className="footer-sep">·</span>
          <span>🇧🇭 Bahrain</span>
          <span className="footer-sep">·</span>
          <span>{APP_URL.replace('https://', '')}</span>
        </div>

      </div>

      {/* ━━━ STYLES ━━━ */}
      <style>{`
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #1A1A1A;
          font-family: 'DM Sans', 'Cairo', 'Segoe UI', sans-serif;
        }

        /* ── Screen controls ── */
        .screen-controls { position: sticky; top: 0; z-index: 10; }

        /* ── Flyer container ── */
        .flyer-page {
          width: 148mm;
          min-height: 210mm;
          margin: 20px auto 40px;
          background: #F5F0E8;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          overflow: hidden;
          position: relative;
        }

        /* ── Header ── */
        .flyer-header {
          background: #1A1A1A;
          padding: 20px 22px 18px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        /* dot-grid */
        .flyer-grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* red glow */
        .flyer-glow {
          position: absolute;
          top: -60px; left: -60px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(232,75,26,0.22) 0%, transparent 70%);
          pointer-events: none;
        }

        .flyer-header-inner {
          position: relative;
          z-index: 1;
        }

        .flyer-logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .flyer-brand {
          font-family: 'DM Sans', 'Cairo', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }
        .flyer-brand-accent { color: #E84B1A; }

        .flyer-headline-ar {
          font-family: 'Cairo', sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: white;
          letter-spacing: 0.02em;
          margin-bottom: 2px;
          direction: rtl;
        }

        .flyer-headline-en {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .flyer-sub {
          font-size: 9.5px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.02em;
        }

        /* ── Body ── */
        .flyer-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #F5F0E8;
        }

        /* ── Section ── */
        .flyer-section {
          padding: 14px 22px 12px;
        }

        .flyer-section-label {
          display: inline-block;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #E84B1A;
          background: rgba(232,75,26,0.1);
          border: 0.5px solid rgba(232,75,26,0.3);
          border-radius: 20px;
          padding: 2px 8px;
          margin-bottom: 8px;
        }

        .flyer-h1 {
          font-size: 14px;
          font-weight: 800;
          color: #1A1A1A;
          line-height: 1.3;
          margin-bottom: 3px;
        }

        .flyer-h2 {
          font-size: 12px;
          color: #666660;
          line-height: 1.4;
          margin-bottom: 10px;
        }
        .flyer-h2 strong { color: #E84B1A; }

        /* Feature list */
        .flyer-features {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px 10px;
        }

        .flyer-features li {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          font-size: 10px;
          color: #3d3d3a;
          line-height: 1.4;
        }

        .ar-section .flyer-features li { direction: rtl; }
        .en-section .flyer-features li { direction: ltr; }

        .check {
          color: #E84B1A;
          font-weight: 900;
          font-size: 10px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── Divider ── */
        .flyer-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 22px;
          margin: 2px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(26,26,26,0.12);
        }

        .divider-badge {
          font-size: 8px;
          font-weight: 800;
          color: #888880;
          letter-spacing: 0.15em;
          white-space: nowrap;
        }

        /* ── QR section ── */
        .flyer-qr-section {
          background: #1A1A1A;
          padding: 16px 22px 14px;
          display: flex;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* subtle dot-grid on QR section too */
        .flyer-qr-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 16px 16px;
          pointer-events: none;
        }

        .flyer-qr-card {
          display: flex;
          align-items: center;
          gap: 18px;
          position: relative;
          z-index: 1;
        }

        .qr-wrapper {
          border: 2px solid #E84B1A;
          border-radius: 10px;
          padding: 6px;
          background: white;
          flex-shrink: 0;
        }

        .qr-labels {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .qr-cta-ar {
          font-size: 13px;
          font-weight: 800;
          color: white;
          direction: rtl;
        }

        .qr-url {
          font-size: 10px;
          color: #E84B1A;
          font-weight: 600;
          letter-spacing: 0.3px;
          direction: ltr;
        }

        .qr-cta-en {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          direction: ltr;
        }

        /* ── Footer ── */
        .flyer-footer {
          background: #111111;
          padding: 7px 20px;
          text-align: center;
          font-size: 9.5px;
          color: #888880;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .footer-sep { opacity: 0.3; }

        /* ── Print ── */
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .flyer-page {
            width: 148mm;
            min-height: 210mm;
            margin: 0;
            box-shadow: none;
          }
          @page {
            size: A5 portrait;
            margin: 0;
          }
        }

        /* ── Responsive screen preview ── */
        @media screen and (max-width: 600px) {
          .flyer-page { width: 95vw; }
          body { background: #1A1A1A; }
        }
      `}</style>
    </>
  )
}
