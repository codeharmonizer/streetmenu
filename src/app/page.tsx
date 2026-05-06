import Link from 'next/link'
import { QrCode, UtensilsCrossed, BarChart3, Smartphone, MapPin, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
            <QrCode size={16} color="white" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>StreetMenu</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm px-4 py-2">تسجيل الدخول</Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2">ابدأ مجاناً</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
          <span>🔥</span> مجاني لأصحاب البسطات
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}>
          الزبائن يمسحون.<br />
          <span style={{ color: 'var(--brand)' }}>أنتَ تبيع أكثر.</span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
          أعطِ بسطتك أو شاحنة طعامك أو مطبخك المنزلي قائمة رقمية في دقائق.
          رمز QR واحد. لا تطبيق مطلوب من زبائنك.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="btn-primary text-base px-8 py-3">
            أنشئ قائمتك — مجاناً
          </Link>
          <Link href="/m/demo" className="btn-secondary text-base px-8 py-3">
            شاهد قائمة تجريبية ←
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-display)' }}>
          جاهز في 3 خطوات
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '٠١', icon: UtensilsCrossed, title: 'أنشئ قائمتك', desc: 'أضف أطباقك مع الصور والأسعار والأوصاف. لا خبرة تقنية مطلوبة.' },
            { step: '٠٢', icon: QrCode, title: 'احصل على رمز QR', desc: 'حمّل واطبع رمز QR الخاص بك. ضعه بالقرب من بسطتك.' },
            { step: '٠٣', icon: Smartphone, title: 'الزبائن يمسحون ويشترون', desc: 'يمسحون، يرون قائمتك كاملة فوراً، لا تطبيق مطلوب. فقط كاميرا هاتفهم.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="card relative overflow-hidden">
              <div className="absolute top-4 left-4 text-5xl font-black opacity-5"
                style={{ fontFamily: 'var(--font-display)' }}>{step}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'var(--brand-light)' }}>
                <Icon size={20} style={{ color: 'var(--brand)' }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-display)' }}>
          كل ما تحتاجه
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: QrCode, title: 'رمز QR فوري', desc: 'يُولّد تلقائياً، قابل للتحميل والطباعة.' },
            { icon: Smartphone, title: 'قوائم للهاتف أولاً', desc: 'جميلة على كل هاتف، لا تطبيق مطلوب.' },
            { icon: BarChart3, title: 'إحصائيات المسح', desc: 'شاهد كم شخصاً عرض قائمتك اليوم.' },
            { icon: MapPin, title: 'خريطة الاكتشاف', desc: 'اجعل الزبائن القريبين منك يجدونك على الخريطة.' },
            { icon: Star, title: 'التقييمات', desc: 'يترك الزبائن تقييمات تبني سمعتك.' },
            { icon: UtensilsCrossed, title: 'تبديل النفاد', desc: 'علّم الأصناف غير المتوفرة في الوقت الفعلي.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl" style={{ background: 'var(--surface-2)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--surface)' }}>
                <Icon size={16} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">{title}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl p-12 text-center text-white" style={{ background: 'var(--brand)' }}>
          <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            ابدأ البيع بذكاء اليوم
          </h2>
          <p className="text-lg mb-8 opacity-90">
            مجاني للبدء. لا بطاقة ائتمان. الإعداد يستغرق 5 دقائق.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-white font-semibold px-8 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5"
            style={{ color: 'var(--brand)' }}>
            أنشئ قائمتك المجانية ←
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <p>© 2024 StreetMenu. مصنوع لأهل الشارع.</p>
      </footer>
    </div>
  )
}
