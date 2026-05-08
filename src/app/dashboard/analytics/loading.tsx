export default function AnalyticsLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-32 rounded-xl mb-2" style={{ background: 'var(--surface-2)' }} />
        <div className="h-4 w-56 rounded-lg"      style={{ background: 'var(--surface-2)' }} />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-5">
            <div className="w-5 h-5 rounded mb-3"  style={{ background: 'var(--surface-2)' }} />
            <div className="h-8 w-12 rounded mb-1" style={{ background: 'var(--surface-2)' }} />
            <div className="h-3 w-20 rounded"      style={{ background: 'var(--surface-2)' }} />
          </div>
        ))}
      </div>
      <div className="card p-6">
        <div className="h-32 rounded-xl" style={{ background: 'var(--surface-2)' }} />
      </div>
    </div>
  )
}
