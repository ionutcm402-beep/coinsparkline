import Link from "next/link";
import {notFound} from "next/navigation";
import Header from "@/components/Header";
import RegimeChart from "@/components/RegimeChart";
import SparkHistoryChart from "@/components/SparkHistoryChart";
import HistoricalSignalTest from "@/components/HistoricalSignalTest";
import CurrencyAmount from "@/components/CurrencyAmount";
import {RegimeBadge,SparkBadge} from "@/components/ui";
import {fetchPriceHistory,fetchCoinDetails} from "@/lib/coingecko";
import {fitRegime} from "@/lib/regimeModel";
import {buildSparkHistory} from "@/lib/sparkHistory";
import {buildSignalBacktest} from "@/lib/signalBacktest";
import {coinCategory} from "@/lib/categories";
import {formatCompactNumber} from "@/lib/format";

export const revalidate=1800;
type WalletOption={name:string;note:string;url:string};
function walletsFor(id:string,platforms:string[],homepage?:string|null):WalletOption[]{const has=(n:string)=>platforms.some(p=>p.toLowerCase().includes(n));if(id==="bitcoin")return[{name:"Ledger",note:"Hardware wallet",url:"https://www.ledger.com/"},{name:"Trezor",note:"Hardware wallet",url:"https://trezor.io/"},{name:"Electrum",note:"Bitcoin desktop wallet",url:"https://electrum.org/"}];if(id==="solana"||has("solana"))return[{name:"Phantom",note:"Solana wallet",url:"https://phantom.com/"},{name:"Solflare",note:"Solana wallet",url:"https://solflare.com/"},{name:"Ledger",note:"Hardware wallet",url:"https://www.ledger.com/"}];if(id==="cardano"||has("cardano"))return[{name:"Lace",note:"Cardano wallet",url:"https://www.lace.io/"},{name:"Eternl",note:"Cardano wallet",url:"https://eternl.io/"},{name:"Ledger",note:"Hardware wallet",url:"https://www.ledger.com/"}];if(id==="zcash")return[{name:"Zashi",note:"Zcash wallet",url:"https://electriccoin.co/zashi/"},{name:"YWallet",note:"Zcash wallet",url:"https://ywallet.app/"}];if(id==="monero")return[{name:"Monero GUI",note:"Official desktop wallet",url:"https://www.getmonero.org/downloads/"},{name:"Feather",note:"Lightweight desktop wallet",url:"https://featherwallet.org/"},{name:"Ledger",note:"Hardware integration",url:"https://www.ledger.com/"}];if(id==="ethereum"||has("ethereum"))return[{name:"MetaMask",note:"EVM wallet",url:"https://metamask.io/"},{name:"Rabby",note:"EVM wallet",url:"https://rabby.io/"},{name:"Ledger",note:"Hardware wallet",url:"https://www.ledger.com/"}];if(homepage)return[{name:"Official wallet guidance",note:"Check project support",url:homepage}];return[]}
function Arrow(){return <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M6 14 14 6M8 6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}

export default async function CoinDetailPage({params}:{params:Promise<{id:string}>}){
  const{id}=await params;
  const[history,details]=await Promise.all([fetchPriceHistory(id,365).catch(()=>null),fetchCoinDetails(id).catch(()=>null)]);
  if(!history?.length)notFound();
  const fit=fitRegime(history.map(h=>({date:h.date,close:h.close})));
  if(!fit)notFound();

  const category=coinCategory(id);
  const calm=fit.currentState===0;
  const mood:"Calm"|"Volatile"=calm?"Calm":"Volatile";
  const displayName=id.charAt(0).toUpperCase()+id.slice(1).replace(/-/g," ");
  const symbol=details?.symbol||id.slice(0,5).toUpperCase();
  const chartPoints=fit.dates.map((date,i)=>({date,close:fit.closes[i],state:fit.hiddenStates[i]}));
  const sparkHistory=buildSparkHistory(fit,id,displayName,symbol);
  const sparkScore=Math.round(sparkHistory.at(-1)?.score??0);
  const backtest=buildSignalBacktest(sparkHistory);
  const confidence=Math.round(fit.confidence*100);
  const wallets=walletsFor(id,details?.platforms||[],details?.homepage);
  const current=details?.currentPrice??fit.closes[fit.closes.length-1];
  const xQuery=encodeURIComponent(displayName);
  const interpretation=sparkScore>=70
    ?`${displayName} is showing elevated signal intensity. The priority is to understand whether the current ${mood.toLowerCase()} regime is strengthening or beginning to exhaust.`
    :sparkScore>=45
      ?`${displayName} is showing meaningful but not extreme signal activity. Watch the regime trajectory and confidence before treating the move as persistent.`
      :`${displayName} is not showing unusually strong signal intensity right now. The current regime matters more than short-term noise.`;

  return <div className="cs-coin-page"><Header/><main className="cs-coin-main">
    <Link href="/" className="cs-coin-back">← Back to market</Link>

    <section className="cs-coin-hero" aria-labelledby="coin-title">
      <div>
        <div className="cs-coin-identity">
          <div className="cs-coin-logo">{details?.imageUrl?<img src={details.imageUrl} alt=""/>:<span>{symbol.slice(0,4)}</span>}</div>
          <div><p className="cs-coin-symbol">{symbol} · {category}</p><h1 id="coin-title" className="cs-coin-title">{displayName}</h1></div>
        </div>
        <p className="cs-coin-price"><CurrencyAmount usd={current}/></p>
        <div className="cs-coin-meta"><RegimeBadge regime={mood}/><SparkBadge score={sparkScore}/><span className="cs-badge cs-badge--neutral">{fit.streakDays} day regime streak</span></div>
      </div>

      <aside className="cs-coin-reading" aria-label="Current CoinSparkLine interpretation">
        <p className="cs-coin-reading-label">What is happening now</p>
        <div className="cs-coin-reading-top">
          <div><div className="cs-coin-reading-score">{sparkScore}<small>/100</small></div><span className="cs-coin-symbol">SparkScore</span></div>
          <div className="cs-coin-reading-state"><strong>{mood}</strong><span>{confidence}% model confidence</span></div>
        </div>
        <p className="cs-coin-reading-copy">{interpretation}</p>
      </aside>
    </section>

    <section className="cs-coin-section"><div className="cs-coin-section-head"><div><p className="cs-eyebrow">Regime intelligence</p><h2>What the model sees</h2><p>Price is context. The regime view shows whether market behaviour is staying stable or shifting into a more volatile state.</p></div></div><div className="cs-coin-panel"><RegimeChart points={chartPoints}/></div></section>

    <section className="cs-coin-section"><div className="cs-coin-section-head"><div><p className="cs-eyebrow">Signal trajectory</p><h2>How SparkScore evolved</h2><p>Use the 30-day, 90-day and one-year views to see whether signal intensity is building, fading or staying flat.</p></div></div><div className="cs-coin-panel"><SparkHistoryChart points={sparkHistory}/></div></section>

    <section className="cs-coin-section"><div className="cs-coin-section-head"><div><p className="cs-eyebrow">Historical context</p><h2>When conditions looked similar before</h2><p>Compare similar historical SparkScore, regime and confidence conditions with the returns that followed over 7, 30 and 90 days.</p></div></div><HistoricalSignalTest test={backtest}/></section>

    <section className="cs-coin-section"><div className="cs-coin-section-head"><div><p className="cs-eyebrow">Market structure</p><h2>The numbers worth keeping in view</h2></div></div><div className="cs-coin-metrics">{[["Market cap",details?.marketCap?`$${formatCompactNumber(details.marketCap)}`:"—"],["All-time high",details?.ath?`$${details.ath.toLocaleString(undefined,{maximumFractionDigits:4})}`:"—"],["Circulating supply",details?.circulatingSupply?formatCompactNumber(details.circulatingSupply):"—"],["Max supply",details?.maxSupply?formatCompactNumber(details.maxSupply):"—"]].map(([label,value])=><div key={label} className="cs-coin-metric"><span>{label}</span><strong>{value}</strong></div>)}</div></section>

    {details?.purchaseMarkets?.length?<section className="cs-coin-section"><div className="cs-coin-section-head"><div><p className="cs-eyebrow">Execution</p><h2>Markets for {symbol}</h2></div></div><div className="cs-coin-grid">{details.purchaseMarkets.map(m=>m.url?<a key={`${m.name}-${m.pair}`} href={m.url} target="_blank" rel="noopener noreferrer" className="cs-coin-link-card"><div><strong>{m.name}</strong><span className="block mt-1">{m.pair}</span></div><em>View market <Arrow/></em></a>:<div key={`${m.name}-${m.pair}`} className="cs-coin-link-card"><div><strong>{m.name}</strong><span className="block mt-1">{m.pair}</span></div><span>Search this pair on the exchange.</span></div>)}</div></section>:null}

    {wallets.length?<section className="cs-coin-section"><div className="cs-coin-section-head"><div><p className="cs-eyebrow">Custody</p><h2>Ways to hold {symbol}</h2><p>These are research starting points, not endorsements. Always verify exact asset and network support before sending funds.</p></div></div><div className="cs-coin-grid">{wallets.map(w=><a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer" className="cs-coin-link-card"><div><strong>{w.name}</strong><span className="block mt-1">{w.note}</span></div><em>Open website <Arrow/></em></a>)}</div></section>:null}

    <section className="cs-coin-section"><div className="cs-coin-section-head"><div><p className="cs-eyebrow">Research</p><h2>Go deeper outside CoinSparkLine</h2></div></div><div className="cs-coin-grid">{[{name:"CoinGecko",href:`https://www.coingecko.com/en/coins/${id}`},{name:"Official website",href:details?.homepage},{name:"X / Twitter",href:`https://x.com/search?q=${xQuery}`},{name:"YouTube",href:`https://www.youtube.com/results?search_query=${encodeURIComponent(displayName+" crypto")}`},{name:"Reddit",href:`https://www.reddit.com/search/?q=${encodeURIComponent(displayName+" crypto")}`}].filter(x=>x.href).map(x=><a key={x.name} href={x.href!} target="_blank" rel="noopener noreferrer" className="cs-coin-link-card"><strong>{x.name}</strong><em>Open source <Arrow/></em></a>)}</div></section>

    {details?.description?<section className="cs-coin-section cs-coin-about"><p className="cs-eyebrow">Asset profile</p><h2>About {displayName}</h2><p dangerouslySetInnerHTML={{__html:details.description}}/></section>:null}
    <p className="cs-coin-disclaimer">CoinSparkLine describes observed market behaviour and research signals. It does not provide financial advice.</p>
  </main></div>
}
