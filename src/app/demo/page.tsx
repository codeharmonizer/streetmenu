import Link from 'next/link'
import { MapPin, Clock, Phone, Star } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'بسطة أم خالد — تجريبي | ScanBite',
  description: 'شاهد كيف تبدو قائمة ScanBite الرقمية. هذه قائمة تجريبية.',
}

const ITEMS = [
  {
    category: 'مشويات',
    items: [
      { name: 'مشاوي مشكلة', desc: 'لحم وفراخ مشوية مع صلصات بيتية', price: '٢.٥٠٠ د.ب', emoji: '🥩', available: true },
      { name: 'دجاج مشوي كامل', desc: 'دجاجة كاملة متبلة على الفحم', price: '١.٨٠٠ د.ب', emoji: '🍗', available: true },
      { name: 'كباب حاشي', desc: 'كباب لحم مفروم متبل بالثوم والبقدونس', price: '١.٢٠٠ د.ب', emoji: '🍢', available: true },
    ],
  },
  {
    category: 'مقبلات',
    items: [
      { name: 'حمص بالطحينة', desc: 'حمص ناعم مع زيت زيتون وبابريكا', price: '٠.٨٠٠ د.ب', emoji: '🫘', available: true },
      { name: 'فتوش', desc: 'سلطة خضار طازجة بخبز مقرمش', price: '٠.٦٠٠ د.ب', emoji: '🥗', available: true },
      { name: 'ثريد لحم', desc: 'الطبق البحريني الكلاسيكي', price: '١.٥٠٠ د.ب', emoji: '🍲', available: false },
    ],
  },
  {
    category: 'مشروبات',
    items: [
      { name: 'ماء بارد', desc: '', price: '٠.١٠٠ د.ب', emoji: '💧', available: true },
      { name: 'عصير تمر هندي', desc: 'طازج ومنعش', price: '٠.٣٠٠ د.ب', emoji: '🥤', available: true },
    ],
  },
]

const REVIEWS = [
  { name: 'محمد ع.', rating: 5, comment: 'أحلى مشاوي في البحرين! الكباب خرافي والسعر ممتاز.' },
  { name: 'فاطمة س.', rating: 5, comment: 'دائمة نجيب من هنا، المعاملة حلوة وكل شي طازج.' },
  { name: 'عبدالله م.', rating: 4, comment: 'تسلم الأيادي، بس أتمنى يفتحون أبكر شوي.' },
]

const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length

export default function DemoPage() {
  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg)' }}>

      {/* Demo banner */}
      <div className="py-2 px-4 text-center text-xs font-semibold" style={{ background: 'var(--brand)', color: 'white' }}>
        🎯 هذه قائمة تجريبية — &nbsp;
        <Link href="/register" className="underline font-bold">أنشئ قائمتك الآن مجاناً</Link>
      </div>

      {/* Header */}
      <div className="px-4 pt-8 pb-6 max-w-lg mx-auto">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 font-bold text-white"
            style={{ background: 'var(--brand)' }}>
            بس
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', lineHeight: 1.3 }}>
              بسطة أم خالد
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
                مأكولات بحرينية 🇧🇭
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: '#dcfce7', color: '#15803d' }}>
                ● مفتوح الآن
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                {avgRating.toFixed(1)} ({REVIEWS.length} تقييمات)
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          مشاوي بيتية على الفحم بتتبيلة الجدة. موجودين كل يوم بسوق المنامة من الساعة ١٢ ظهراً.
        </p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <MapPin size={13} style={{ color: 'var(--brand)' }} /> سوق المنامة، المنامة، البحرين
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <Clock size={13} style={{ color: 'var(--brand)' }} /> ١٢:٠٠ ظهراً – ١٠:٠٠ مساءً
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--brand)' }}>
            <Phone size={13} /> ٣٣١٢٣٤٥٦ (واتساب)
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-lg mx-auto px-4">
        {ITEMS.map(({ category, items }) => (
          <div key={category} className="mb-8">
            <h2 className="font-bold text-sm uppercase tracking-wider mb-3"
              style={{ color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
              {category}
            </h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.name} className="card flex gap-4 p-4"
                  style={{ opacity: item.available ? 1 : 0.55 }}>
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: 'var(--surface-2)', fontSize: '2rem' }}>
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{item.name}</p>
                    {item.desc && (
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                    )}
                    <p className="font-bold mt-2" style={{ color: 'var(--brand)' }}>{item.price}</p>
                    {!item.available && (
                      <span className="text-xs mt-1 inline-block" style={{ color: 'var(--text-muted)' }}>غير متوفر حالياً</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <h2 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          التقييمات ({REVIEWS.length})
        </h2>
        <div className="space-y-3 mb-6">
          {REVIEWS.map(r => (
            <div key={r.name} className="card p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={13}
                      fill={s <= r.rating ? '#f59e0b' : 'none'}
                      stroke={s <= r.rating ? '#f59e0b' : '#d1d5db'} />
                  ))}
                </div>
                <span className="text-sm font-medium">{r.name}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center mt-10 px-4">
        <div className="inline-block rounded-2xl p-5 max-w-sm w-full"
          style={{ background: 'var(--brand-light)', border: '1px solid #ffd4a8' }}>
          <p className="font-bold mb-1" style={{ color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
            أعجبتك القائمة؟
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            أنشئ قائمتك الرقمية مجاناً في 5 دقائق.
          </p>
          <Link href="/register" className="btn-primary w-full py-2.5">
            ابدأ مجاناً ←
          </Link>
        </div>
        <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          مدعوم من <Link href="/" className="font-semibold hover:underline" style={{ color: 'var(--brand)' }}>ScanBite</Link>
        </p>
      </div>

    </div>
  )
}
