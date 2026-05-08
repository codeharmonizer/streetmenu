export default function MenuLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-9 w-28 rounded-xl mb-2" style={{ background: 'var(--surface-2)' }} />
          <div className="h-4 w-20 rounded-lg"      style={{ background: 'var(--surface-2)' }} />
        </div>
        <div className="h-10 w-28 rounded-xl" style={{ background: 'var(--surface-2)' }} />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="card flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-xl flex-shrink-0" style={{ background: 'var(--surface-2)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-md" style={{ background: 'var(--surface-2)' }} />
              <div className="h-3 w-48 rounded-md" style={{ background: 'var(--surface-2)' }} />
              <div className="h-4 w-16 rounded-md" style={{ background: 'var(--surface-2)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
