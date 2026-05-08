export default function DashboardLoading() {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-9 w-32 rounded-xl mb-2" style={{ background: 'var(--surface-2)' }} />
        <div className="h-4 w-48 rounded-lg"      style={{ background: 'var(--surface-2)' }} />
      </div>

      {/* Banner skeleton */}
      <div className="h-16 rounded-2xl mb-6" style={{ background: 'var(--surface-2)' }} />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-5">
            <div className="w-9 h-9 rounded-lg mb-4" style={{ background: 'var(--surface-2)' }} />
            <div className="h-8 w-12 rounded-lg mb-1" style={{ background: 'var(--surface-2)' }} />
            <div className="h-4 w-24 rounded-md"      style={{ background: 'var(--surface-2)' }} />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="h-5 w-32 rounded-lg mb-4" style={{ background: 'var(--surface-2)' }} />
      <div className="grid sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card flex items-center gap-4 p-4">
            <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: 'var(--surface-2)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 rounded-md" style={{ background: 'var(--surface-2)' }} />
              <div className="h-3 w-40 rounded-md" style={{ background: 'var(--surface-2)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
