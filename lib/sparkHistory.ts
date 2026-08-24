import {RegimeFit} from "@/lib/regimeModel";
import {getSparkScore} from "@/lib/sparkScore";
import {Coin} from "@/types/coin";

export interface SparkHistoryPoint {
  date:string;
  score:number;
  confidence:number;
  regime:"calm"|"volatile";
  price:number;
  change24hPct:number;
}

function medianFlipDays(fit:RegimeFit,state:number){
  const pStay=Math.min(fit.transmat[state][state],0.999999);
  const result=Math.log(0.5)/Math.log(pStay);
  return Number.isFinite(result)&&result>0?result:1;
}

/**
 * Reconstructs the historical SparkScore path from the fitted HMM series.
 * This uses the model's historical state probabilities and states at each date,
 * rather than pretending archived live SparkScores existed before we stored them.
 */
export function buildSparkHistory(fit:RegimeFit,id:string,name:string,symbol:string):SparkHistoryPoint[]{
  let streak=0;
  let previousState:number|null=null;
  return fit.dates.map((date,i)=>{
    const state=fit.hiddenStates[i];
    streak=previousState===state?streak+1:1;
    previousState=state;
    const currentPrice=fit.closes[i];
    const priorPrice=i>0?fit.closes[i-1]:currentPrice;
    const change24hPct=priorPrice?((currentPrice-priorPrice)/priorPrice)*100:0;
    const coin:Coin={
      id,
      name,
      symbol,
      category:"Historical",
      price:currentPrice,
      change24hPct,
      regimeState:state===0?"calm":"volatile",
      confidencePct:(fit.stateProbs[i]?.[state]??0.5)*100,
      streakDays:streak,
      medianDaysToFlip:medianFlipDays(fit,state),
    };
    return {
      date,
      score:getSparkScore(coin).score,
      confidence:coin.confidencePct,
      regime:coin.regimeState,
      price:currentPrice,
      change24hPct,
    };
  });
}
