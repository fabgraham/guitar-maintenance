export function LoadingSkeleton({ label = 'Loading your collection…' }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map(index => (
        <div key={index} className="panel skeleton" aria-hidden="true">
          <div className="h-4 w-2/5 rounded bg-surface-3 mb-3" />
          <div className="h-3 w-3/5 rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}
