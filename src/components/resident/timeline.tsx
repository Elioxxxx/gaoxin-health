export function Timeline({
  items,
}: {
  items: Array<{ title: string; description: string; date?: string }>
}) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="relative pl-5">
          <div className="absolute left-0 top-1.5 size-2 rounded-full bg-emerald-500" />
          {index < items.length - 1 ? (
            <div className="absolute bottom-0 left-[3px] top-4 w-px bg-emerald-100" />
          ) : null}
          <div className="pb-4">
            <p className="text-sm font-medium text-slate-900">{item.title}</p>
            {item.date ? (
              <p className="mt-0.5 text-xs text-slate-400">{item.date}</p>
            ) : null}
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
