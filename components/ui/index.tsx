import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const cx=(...v:(string|false|null|undefined)[])=>v.filter(Boolean).join(" ");

export function Button({variant="primary",loading=false,className="",children,disabled,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:"primary"|"secondary"|"ghost"|"destructive";loading?:boolean}){return <button className={cx("cs-button",`cs-button--${variant}`,className)} disabled={disabled||loading} aria-busy={loading||undefined} {...props}>{loading&&<span className="cs-spinner" aria-hidden="true"/>}{children}</button>}

export function Card({variant="standard",interactive=false,className="",...props}:HTMLAttributes<HTMLDivElement>&{variant?:"standard"|"raised"|"muted";interactive?:boolean}){return <div className={cx("cs-card",`cs-card--${variant}`,interactive&&"cs-card--interactive",className)} {...props}/>}

export function Badge({tone="neutral",className="",...props}:HTMLAttributes<HTMLSpanElement>&{tone?:"neutral"|"brand"|"success"|"danger"|"warning"}){return <span className={cx("cs-badge",`cs-badge--${tone}`,className)} {...props}/>}

export function RegimeBadge({regime}:{regime:"Calm"|"Building"|"Awakening"|"Volatile"}){return <span className="cs-badge cs-regime" data-regime={regime.toLowerCase()}>{regime}</span>}
export function SparkBadge({score}:{score:number}){const label=score>=85?"Extreme":score>=70?"Hot":score>=55?"Active":score>=40?"Stirring":"Quiet";return <span className="cs-badge cs-spark" data-level={label.toLowerCase()}>SparkScore · {label}</span>}
export function SystemBadge({status="Live"}:{status?:"Live"|"Updating"|"Delayed"|"Offline"|"Synced"|"Error"}){return <span className="cs-badge cs-system" data-status={status.toLowerCase()}>{status==="Live"&&<i/>}{status}</span>}

export function SectionHeading({eyebrow,title,description,action}:{eyebrow?:string;title:string;description?:string;action?:ReactNode}){return <div className="cs-section-heading"><div>{eyebrow&&<p className="cs-eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description&&<p className="cs-section-copy">{description}</p>}</div>{action&&<div className="cs-section-action">{action}</div>}</div>}
export function PageHero({eyebrow,title,description,action}:{eyebrow?:string;title:ReactNode;description?:string;action?:ReactNode}){return <header className="cs-page-hero">{eyebrow&&<p className="cs-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description&&<p>{description}</p>}{action&&<div className="cs-page-hero__action">{action}</div>}</header>}

export function SegmentedControl({items,value,onChange,label="View"}:{items:string[];value:string;onChange:(value:string)=>void;label?:string}){return <div className="cs-segmented" role="group" aria-label={label}>{items.map(item=><button key={item} type="button" data-active={value===item} aria-pressed={value===item} onClick={()=>onChange(item)}>{item}</button>)}</div>}

export function Input({className="",...props}:InputHTMLAttributes<HTMLInputElement>){return <input className={cx("cs-input",className)} {...props}/>}
export function Select({className="",...props}:SelectHTMLAttributes<HTMLSelectElement>){return <select className={cx("cs-input",className)} {...props}/>}

export function DataTable({children,className=""}:{children:ReactNode;className?:string}){return <div className={cx("cs-table-shell",className)}><table className="cs-table">{children}</table></div>}
export function TableRow({selected=false,direction,className="",...props}:HTMLAttributes<HTMLTableRowElement>&{selected?:boolean;direction?:"up"|"down"}){return <tr className={cx("cs-table-row",selected&&"is-selected",className)} data-direction={direction} {...props}/>}

export function Skeleton({className=""}:{className?:string}){return <span className={cx("cs-skeleton",className)} aria-hidden="true"/>}
export function EmptyState({title,description,action}:{title:string;description?:string;action?:ReactNode}){return <Card variant="muted" className="cs-state"><h3>{title}</h3>{description&&<p>{description}</p>}{action}</Card>}
export function ErrorState({title="Something went wrong",description,action}:{title?:string;description?:string;action?:ReactNode}){return <Card variant="muted" className="cs-state cs-state--error"><h3>{title}</h3>{description&&<p>{description}</p>}{action}</Card>}
export function LiveIndicator({label="Live"}:{label?:string}){return <span className="cs-live"><i aria-hidden="true"/>{label}</span>}
