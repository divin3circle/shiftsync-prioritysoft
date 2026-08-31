export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="bg-muted h-7 w-40 rounded-lg" />
        <div className="bg-muted h-4 w-72 rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-muted h-28 rounded-xl" />
        ))}
      </div>
      <div className="bg-muted h-72 rounded-xl" />
    </div>
  )
}
