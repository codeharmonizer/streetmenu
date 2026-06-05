import FlyerQR from '@/components/flyer/FlyerQR'
import PrintButton from './PrintButton'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://streetmenu-ten.vercel.app'
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
        <div style={{ textAlign: 'center', padding: '24px 16px 8px', background: '#f5f4f0' }}>
          <p style={{ fontSize: 13, color: '#6b6760', marginBottom: 12 }}>
            اضغط "طباعة" لتصدير الفلاير كـ PDF أو طباعته مباشرة
            &nbsp;·&nbsp;
            Press "Print" to export as PDF or print directly
          </p>
          <PrintButton />
        </div>
      </div>

      {/* ── Flyer ── */}
      <div className="flyer-page" id="flyer">

        {/* ━━━ HEADER ━━━ */}
        <div className="flyer-header">
          <div className="flyer-logo-row">
            {/* QR icon */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.2"/>
              <rect x="7" y="7" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="8.5" y="8.5" width="4" height="4" rx="0.5" fill="#ff6b00"/>
              <rect x="18" y="7" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="19.5" y="8.5" width="4" height="4" rx="0.5" fill="#ff6b00"/>
              <rect x="7" y="18" width="7" height="7" rx="1.5" fill="white"/>
              <rect x="8.5" y="19.5" width="4" height="4" rx="0.5" fill="#ff6b00"/>
              <rect x="18" y="18" width="3" height="3" rx="0.5" fill="white"/>
              <rect x="23" y="18" width="2" height="2" rx="0.5" fill="white"/>
              <rect x="18" y="23" width="2" height="2" rx="0.5" fill="white"/>
              <rect x="22" y="22" width="3" height="3" rx="0.5" fill="white"/>
            </svg>
            <span className="flyer-brand">ScanBite</span>
          </div>
          <p className="flyer-tagline-ar">امسح. شاهد. كل. — قوائم رقمية وطلبات أونلاين</p>
          <p className="flyer-tagline-en">Scan it. See it. Eat it. — Digital menus &amp; ordering</p>
        </div>

        {/* ━━━ BODY ━━━ */}
        <div className="flyer-body">

          {/* ── Arabic section ── */}
          <div className="flyer-section ar-section" dir="rtl">
            <div className="flyer-headline-ar">
              <span className="flyer-emoji">🍢</span>
              <div>
                <p className="flyer-h1-ar">هل لديك مطعم أو بسطة أو مشروع طعام؟</p>
                <p className="flyer-h2-ar">حوّل قائمتك رقمياً في <strong>5 دقائق!</strong></p>
              </div>
            </div>
            <ul className="flyer-features-ar">
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
            <div className="divider-badge">
              <span>AR</span>
              <span className="dot">·</span>
              <span>EN</span>
            </div>
            <div className="divider-line" />
          </div>

          {/* ── English section ── */}
          <div className="flyer-section en-section" dir="ltr">
            <div className="flyer-headline-en">
              <span className="flyer-emoji">🍢</span>
              <div>
                <p className="flyer-h1-en">Restaurant, stall, or food business?</p>
                <p className="flyer-h2-en">Go digital in <strong>5 minutes!</strong></p>
              </div>
            </div>
            <ul className="flyer-features-en">
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
          <p>
            <span>ScanBite 🇧🇭 Bahrain</span>
            <span className="footer-sep">·</span>
            <span>{APP_URL.replace('https://', '')}</span>
          </p>
        </div>

      </div>

      {/* ━━━ STYLES ━━━ */}
      <style>{`
        /* ── Reset & base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #e8e6e0; font-family: 'Cairo', 'Segoe UI', sans-serif; }

        /* ── Screen wrapper ── */
        .screen-controls { position: sticky; top: 0; z-index: 10; }

        /* ── Flyer container ── */
        .flyer-page {
          width: 148mm;
          min-height: 210mm;
          margin: 20px auto 40px;
          background: white;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          overflow: hidden;
          position: relative;
        }

        /* ── Header ── */
        .flyer-header {
          background: linear-gradient(135deg, #ff6b00 0%, #e85d00 100%);
          padding: 18px 20px 16px;
          text-align: center;
          color: white;
        }
        .flyer-logo-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .flyer-brand {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: white;
        }
        .flyer-tagline-ar {
          font-size: 11px;
          opacity: 0.92;
          margin-bottom: 2px;
          direction: rtl;
        }
        .flyer-tagline-en {
          font-size: 10px;
          opacity: 0.80;
          direction: ltr;
        }

        /* ── Body ── */
        .flyer-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        /* ── Section ── */
        .flyer-section {
          padding: 16px 22px 14px;
        }

        /* Arabic headline */
        .flyer-headline-ar {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
        }
        .flyer-headline-en {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
        }
        .flyer-emoji {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .flyer-h1-ar {
          font-size: 15px;
          font-weight: 800;
          color: #1a1814;
          line-height: 1.3;
          margin-bottom: 2px;
          direction: rtl;
        }
        .flyer-h2-ar {
          font-size: 13px;
          color: #6b6760;
          direction: rtl;
          line-height: 1.4;
        }
        .flyer-h2-ar strong { color: #ff6b00; }

        .flyer-h1-en {
          font-size: 14px;
          font-weight: 800;
          color: #1a1814;
          line-height: 1.3;
          margin-bottom: 2px;
        }
        .flyer-h2-en {
          font-size: 12px;
          color: #6b6760;
          line-height: 1.4;
        }
        .flyer-h2-en strong { color: #ff6b00; }

        /* Feature lists */
        .flyer-features-ar, .flyer-features-en {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 10px;
        }
        .flyer-features-ar li, .flyer-features-en li {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          font-size: 10.5px;
          color: #3d3d3a;
          line-height: 1.4;
        }
        .flyer-features-ar li { direction: rtl; }
        .flyer-features-en li { direction: ltr; }
        .check {
          color: #ff6b00;
          font-weight: 900;
          font-size: 11px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* ── Divider ── */
        .flyer-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 22px;
          margin: 4px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: #e8e6e0;
        }
        .divider-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 9px;
          font-weight: 700;
          color: #a8a5a0;
          letter-spacing: 1px;
          white-space: nowrap;
        }
        .dot { font-size: 14px; line-height: 1; }

        /* ── QR section ── */
        .flyer-qr-section {
          background: linear-gradient(to bottom, #fff8f0, #fff4e8);
          border-top: 1px solid #ffd4a8;
          padding: 16px 22px 14px;
          display: flex;
          justify-content: center;
        }
        .flyer-qr-card {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .qr-wrapper {
          border: 3px solid #ff6b00;
          border-radius: 12px;
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
          color: #ff6b00;
          direction: rtl;
        }
        .qr-url {
          font-size: 11px;
          color: #1a1814;
          font-weight: 600;
          letter-spacing: 0.3px;
          direction: ltr;
        }
        .qr-cta-en {
          font-size: 11px;
          font-weight: 700;
          color: #6b6760;
          direction: ltr;
        }

        /* ── Footer ── */
        .flyer-footer {
          background: #1a1814;
          padding: 8px 20px;
          text-align: center;
        }
        .flyer-footer p {
          font-size: 10px;
          color: #a8a5a0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        .footer-sep { opacity: 0.4; }

        /* ── Print styles ── */
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
        }
      `}</style>
    </>
  )
}
