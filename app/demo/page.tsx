import Link from "next/link";
import { ArrowUpRight, Bot, Boxes, BriefcaseBusiness, ReceiptText, UsersRound, WalletCards } from "lucide-react";
import { Logo } from "@/components/logo";

const modules = [
  ["CRM", "12 active deals", "$184,500 pipeline", BriefcaseBusiness],
  ["Automation", "3 rules running", "18 actions this month", Bot],
  ["Inventory", "148 catalog items", "4 low-stock alerts", Boxes],
  ["People", "24 employees", "2 leave requests", UsersRound],
  ["Finance", "$42,850 income", "$16,240 expenses", ReceiptText],
] as const;

export default function PublicDemo() {
  return <main className="min-h-screen bg-[#f5f6ef]">
    <nav className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-5">
      <Logo/>
      <div className="flex gap-3">
        <Link className="btn-secondary" href="/">Landing page</Link>
        <Link className="btn" href="/login?mode=signup">Create account</Link>
      </div>
    </nav>
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-moss">Public demo workspace</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Good morning. Here’s the pulse.</h1>
          <p className="mt-2 text-black/50">Explore ERICA without signing in. This workspace contains safe sample data.</p>
        </div>
        <span className="rounded-full bg-lime px-4 py-2 text-xs font-bold">OPEN ACCESS</span>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Pipeline","$184,500",WalletCards],["Customers","86",ArrowUpRight],["Team","24",UsersRound],["Low stock","4",Boxes]].map(([name,value,Icon]:any)=>
          <div className="card" key={name}><Icon className="text-moss" size={20}/><p className="mt-8 text-sm text-black/50">{name}</p><p className="mt-1 text-3xl font-black">{value}</p></div>)}
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {modules.map(([name,stat,detail,Icon])=><div className="card" key={name}><Icon className="text-moss" size={22}/><h2 className="mt-7 text-lg font-black">{name}</h2><p className="mt-2 text-sm font-semibold">{stat}</p><p className="mt-1 text-xs text-black/45">{detail}</p></div>)}
      </section>
      <section className="mt-6 rounded-2xl bg-ink p-7 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-lime">Automation fired</p>
        <h2 className="mt-3 text-2xl font-black">Deal won → customer and invoice created</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">ERICA connected CRM and Finance automatically, recorded the action in the shared timeline, and prepared the next follow-up.</p>
      </section>
    </div>
  </main>
}
