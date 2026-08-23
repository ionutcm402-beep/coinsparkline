import { fetchPriceHistory, fetchTopCoins } from "../lib/coingecko";
import { backtestSeries, summariseByScore, summariseByTier } from "../lib/backtest";

async function main(){
  const apiKey=process.env.COINGECKO_API_KEY;
  const n=Math.max(5,Math.min(Number(process.env.BACKTEST_COINS||20),30));
  const days=Math.max(365,Math.min(Number(process.env.BACKTEST_DAYS||1460),3650));
  const metas=await fetchTopCoins(n,apiKey);
  const all=[] as ReturnType<typeof backtestSeries>;
  const perCoin=[] as {id:string;symbol:string;observations:number}[];
  for(const meta of metas){
    try{
      const history=await fetchPriceHistory(meta.id,days,apiKey);
      const observations=backtestSeries(history,120);
      all.push(...observations);
      perCoin.push({id:meta.id,symbol:meta.symbol.toUpperCase(),observations:observations.length});
      console.log(`${meta.symbol.toUpperCase()}: ${observations.length} observations`);
    }catch(err){console.warn(`Skipping ${meta.id}:`,err instanceof Error?err.message:String(err));}
  }
  const report={generatedAt:new Date().toISOString(),coinsRequested:n,daysRequested:days,totalObservations:all.length,coins:perCoin,scoreBuckets:summariseByScore(all),regimeTiers:summariseByTier(all)};
  console.log("\n=== CoinSparkLine Phase 3 Backtest ===");
  console.table(report.scoreBuckets);
  console.log("\nFour-stage regime validation:");
  console.table(report.regimeTiers);
  console.log("\nJSON_REPORT_START");
  console.log(JSON.stringify(report,null,2));
  console.log("JSON_REPORT_END");
}
main().catch(err=>{console.error(err);process.exit(1)});
