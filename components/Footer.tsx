import Link from "next/link";

const groups=[
 ["Product",[["Market","/"],["Radar","/opportunities"],["Screener","/screener"],["Compare","/compare"],["Watchlist","/watchlist"]]],
 ["Personal",[["Portfolio","/portfolio"],["Alerts","/alerts"],["Sign in","/signin"],["Sign up","/signup"]]],
 ["Research",[["Methodology","/methodology"],["Crypto School","/school"],["Privacy intelligence","/privacy-coins"],["NFT intelligence","/nft"]]],
 ["Trust",[["About","/about"],["Risk disclosure","/risk"],["Disclaimer","/disclaimer"],["Privacy","/privacy"],["Terms","/terms"]]],
] as const;

export default function Footer(){return <footer className="csl-shell-footer"><div className="csl-shell csl-shell-footer__grid"><div className="csl-shell-footer__brand"><div className="csl-shell-wordmark">Coin<strong>SparkLine</strong></div><p>Crypto market behaviour intelligence built around SparkScore, regime and context.</p><small>Signals describe observed market behaviour. They are not personalised investment advice or guarantees of future returns.</small></div>{groups.map(([title,links])=><section key={title}><h2>{title}</h2><div className="csl-shell-footer__links">{links.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}</div></section>)}</div><div className="csl-shell-footer__bottom"><div className="csl-shell"><span>© {new Date().getFullYear()} CoinSparkLine.</span><span>Cryptoassets are high risk. You may lose all money invested.</span></div></div></footer>}
