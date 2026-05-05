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
          <Link href="/login" className="btn-secondary text-sm px-4 py-2">Sign in</Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2">Start free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
          <span>🔥</span> Free for street vendors
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}>
          Customers scan.<br />
          <span style={{ color: 'var(--brand)' }}>You sell more.</span>
        </h1>
        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
          Give your street stall, food truck, or home kitchen a digital menu in minutes.
          One QR code. No app needed for your customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="btn-primary text-base px-8 py-3">
            Create your menu — it's free
          </Link>
          <Link href="/m/demo" className="btn-secondary text-base px-8 py-3">
            See a demo menu →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-display)' }}>
          Ready in 3 steps
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: UtensilsCrossed, title: 'Build your menu', desc: 'Add your dishes with photos, prices, and descriptions. No tech skills needed.' },
            { step: '02', icon: QrCode, title: 'Get your QR code', desc: 'Download and print your unique QR code. Stick it near your stall.' },
            { step: '03', icon: Smartphone, title: 'Customers scan & buy', desc: 'They scan, see your full menu instantly, no app needed. Just their phone camera.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="card relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl font-black opacity-5"
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
          Everything you need
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: QrCode, title: 'Instant QR Code', desc: 'Auto-generated, downloadable, printable.' },
            { icon: Smartphone, title: 'Mobile-first menus', desc: 'Beautiful on every phone, no app needed.' },
            { icon: BarChart3, title: 'Scan analytics', desc: 'See how many people viewed your menu today.' },
            { icon: MapPin, title: 'Discovery map', desc: 'Get found by nearby customers browsing the map.' },
            { icon: Star, title: 'Reviews', desc: 'Customers leave ratings that build your reputation.' },
            { icon: UtensilsCrossed, title: 'Sold-out toggle', desc: 'Mark items unavailable in real time.' },
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
            Start selling smarter today
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Free to start. No credit card. Setup takes 5 minutes.
          </p>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-white font-semibold px-8 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5"
            style={{ color: 'var(--brand)' }}>
            Create your free menu →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <p>© 2024 StreetMenu. Built for the streets.</p>
      </footer>
    </div>
  )
}
