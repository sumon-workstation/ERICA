export function ListSection({title,icon,action,children,empty}:{title:string;icon?:React.ReactNode;action?:React.ReactNode;children?:React.ReactNode;empty?:string}){
 return <section className="card"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2">{icon}<h2 className="text-xl font-black">{title}</h2></div>{action}</div><div className="mt-4 divide-y">{children||<p className="py-8 text-sm text-black/40">{empty||"Nothing here yet."}</p>}</div></section>
}
export function Row({title,subtitle,right}:{title:React.ReactNode;subtitle?:React.ReactNode;right?:React.ReactNode}){
 return <div className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{title}</p>{subtitle&&<p className="mt-0.5 truncate text-xs text-black/40">{subtitle}</p>}</div>{right&&<div className="shrink-0 text-xs font-bold">{right}</div>}</div>
}
export function Badge({children,tone="default"}:{children:React.ReactNode;tone?:"default"|"good"|"warn"|"bad"}){
 const cls={default:"bg-black/5 text-black/60",good:"bg-green-100 text-green-800",warn:"bg-amber-100 text-amber-800",bad:"bg-red-100 text-red-700"}[tone];
 return <span className={`rounded-full px-2 py-1 text-[11px] font-bold capitalize ${cls}`}>{children}</span>
}
