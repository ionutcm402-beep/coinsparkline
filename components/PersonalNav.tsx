"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
const steps=[{href:"/watchlist",label:"Watchlist",copy:"Follow assets"},{href:"/portfolio",label:"Portfolio",copy:"Understand exposure"},{href:"/alerts",label:"Alerts",copy:"Get notified"}];
export default function PersonalNav(){const pathname=usePathname();return <nav className="cs-personal-nav" aria-label="Personal intelligence workflow">{steps.map((s,i)=>{const active=pathname===s.href;return <Link key={s.href} href={s.href} data-active={active} aria-current={active?"page":undefined}><span>{i+1}</span><div><strong>{s.label}</strong><small>{s.copy}</small></div></Link>})}</nav>}
