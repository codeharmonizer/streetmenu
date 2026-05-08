export default function SettingsLoading() {
  return (
    <div className="max-w-2xl animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-28 rounded-xl mb-2" style={{ background: 'var(--surface-2)' }} />
        <div className="h-4 w-48 rounded-lg"      style={{ background: 'var(--surface-2)' }} />
      </div>
      <div className="card mb-6 h-16" style={{ background: 'var(--surface-2)' }} />
      <div className="card space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl flex-shrink-0" style={{ background: 'var(--surface-2)' }} />
          <div className="h-9 w-28 rounded-xl"                 style={{ background: 'var(--surface-2)' }} />
        </div>
        <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i}>
            <div className="h-3 w-24 rounded mb-2"  style={{ background: 'var(--surface-2)' }} />
            <div className="h-10 rounded-xl"         style={{ background: 'var(--surface-2)' }} />
          </div>
        ))}
        <div className="h-10 w-36 rounded-xl"        style={{ background: 'var(--surface-2)' }} />
      </div>
    </div>
  )
}
