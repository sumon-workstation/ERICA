import Link from "next/link";
import { Logo } from "@/components/logo";
import { ArrowRight, Boxes, Bot, BriefcaseBusiness, Check, UsersRound } from "lucide-react";
const modules=[["CRM","Turn relationships into revenue.",BriefcaseBusiness],["Operations","Purchasing, invoices and a clean ledger.",Boxes],["People","From onboarding through leave.",UsersRound],["Automation","Every module working as one.",Bot]];
export default function Landing(){
 return <main>
  <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6"><Logo/><div className="flex items-center gap-3"><Link href="/login" className="btn-secondary">Sign in</Link><Link href="/login?mode=signup" className="btn">Start free</Link></div></nav>
  <section className="mx-auto grid min-h-[76vh] max-w-7xl items-center gap-14 px-6 py-14 lg:grid-cols-[1.1fr_.9fr]">
   <div><div className="mb-6 inline-flex rounded-full bg-lime/50 px-4 py-2 text-xs font-bold uppercase tracking-widest">One company. One source of truth.</div>
    <h1 className="max-w-3xl text-6xl font-black leading-[.93] tracking-[-.055em] sm:text-7xl">Your business finally works like <span className="text-moss">one business.</span></h1>
    <p className="mt-7 max-w-xl text-lg leading-8 text-black/60">ERICA unifies customers, people, money, inventory and workflows—so growing teams move faster without stitching together five tools.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Link href="/login?mode=signup" className="btn gap-2">Start 30-day trial <ArrowRight size={16}/></Link><span className="flex items-center gap-2 px-3 text-sm text-black/55"><Check size={16}/> No card required</span></div>
   </div>
   <div className="rounded-[2rem] bg-ink p-5 text-white shadow-2xl"><div className="mb-8 flex items-center justify-between"><Logo light/><span className="rounded-full bg-white/10 px-3 py-1 text-xs">Live workspace</span></div>
    <div className="grid grid-cols-2 gap-3">{modules.map(([name,desc,Icon])=><div key={name as string} className="rounded-2xl border border-white/10 bg-white/5 p-5"><Icon className="mb-8 text-lime" size={23}/><h3 className="font-bold">{name as string}</h3><p className="mt-1 text-xs leading-5 text-white/50">{desc as string}</p></div>)}</div>
    <div className="mt-3 rounded-2xl bg-lime p-5 text-ink"><p className="text-xs font-bold uppercase tracking-widest">Automation fired</p><p className="mt-2 font-bold">Deal won → customer and invoice created</p></div>
   </div>
  </section>
  <section className="bg-white py-24"><div className="mx-auto max-w-7xl px-6"><p className="text-center text-xs font-bold uppercase tracking-[.25em] text-moss">Simple pricing</p><h2 className="mt-3 text-center text-4xl font-black tracking-tight">Start free. Scale when it works.</h2><div className="card mx-auto mt-10 max-w-xl p-8"><div className="flex items-end justify-between"><div><h3 className="text-2xl font-black">ERICA Growth</h3><p className="mt-2 text-black/55">All five modules included.</p></div><p><b className="text-4xl">$19</b><span className="text-black/50"> /seat/mo</span></p></div><ul className="my-8 grid gap-3 text-sm">{["30-day trial, no card","Unlimited entities and shared history","Cross-module automation","Usage-based workflow runs"].map(x=><li className="flex gap-2" key={x}><Check size={17} className="text-moss"/>{x}</li>)}</ul><Link className="btn w-full" href="/login?mode=signup">Create your workspace</Link></div></div></section>
 </main>
}
