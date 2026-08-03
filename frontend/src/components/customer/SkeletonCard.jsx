export default function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="h-36 w-full bg-black/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-black/10 rounded" />
        <div className="h-3 w-full bg-black/5 rounded" />
        <div className="h-3 w-4/5 bg-black/5 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-14 bg-black/10 rounded" />
          <div className="h-5 w-20 bg-black/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
