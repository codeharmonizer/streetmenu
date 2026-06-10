export default function OrdersLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-9 w-32 rounded-xl mb-2" style={{ background: 'var(--surface-2)' }} />
        <div className="h-4 w-48 rounded-lg"      style={{ background: 'var(--surface-2)' }} />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-9 w-20 rounded-xl" style={{ background: 'var(--surface-2)' }} />
        ))}
      </div>

      {/* Order card skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-6 w-28 rounded-lg" style={{ background: 'var(--surface-2)' }} />
                <div className="h-3 w-36 rounded-md" style={{ background: 'var(--surface-2)' }} />
              </div>
              <div className="h-6 w-16 rounded-lg" style={{ background: 'var(--surface-2)' }} />
            </div>
            <div className="h-4 w-40 rounded-md" style={{ background: 'var(--surface-2)' }} />
            <div className="h-16 rounded-xl"      style={{ background: 'var(--surface-2)' }} />
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-xl" style={{ background: 'var(--surface-2)' }} />
              <div className="h-9 w-20 rounded-xl" style={{ background: 'var(--surface-2)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
