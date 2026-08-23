import { Coin } from "@/types/coin";
import { getSignalTier, SignalTier } from "@/lib/tiers";
import { getSparkScore } from "@/lib/sparkScore";

export type RadarMode = "heating" | "cooling" | "flipped" | "strongest";
export type RadarWindow = "now" | "fresh" | "established";
export interface RadarResult { coin: Coin; tier: SignalTier; score: number; rankScore: number; reason: string; }

const pct=(n:number)=>`${Math.abs(n).toFixed(0)}%`;
function reason(coin:Coin,mode:RadarMode){const tier=getSignalTier(coin);const accel=coin.volatilityAccelerationPct??0;const percentile=coin.volatilityPercentile??0;const spark=getSparkScore(coin).score;
 if(mode==="heating"){if(accel>=20)return `Volatility is accelerating ${pct(accel)} versus its recent baseline.`;if(percentile>=75)return `Volatility sits in the ${percentile.toFixed(0)}th percentile of its own recent history.`;return `${tier} conditions with SparkScore ${spark} and rising transition pressure.`;}
 if(mode==="cooling"){if(accel<=-10)return `Volatility has cooled ${pct(accel)} versus its recent baseline.`;return `${tier} conditions are settling after a more active regime.`;}
 if(mode==="flipped")return `The current ${tier} regime is only ${coin.streakDays} day${coin.streakDays===1?'':'s'} old.`;
 return `SparkScore ${spark}, ${coin.confidencePct.toFixed(0)}% model confidence and ${percentile.toFixed(0)}th-percentile volatility.`;
}
export function getRadarResults(coins:Coin[],mode:RadarMode,window:RadarWindow="now"):RadarResult[]{const pool=coins.filter(c=>window==="fresh"?c.streakDays<=3:window==="established"?c.streakDays>3:true);const ranked=pool.map(coin=>{const tier=getSignalTier(coin),spark=getSparkScore(coin).score,accel=coin.volatilityAccelerationPct??0,percentile=coin.volatilityPercentile??0,hazard=coin.flipHazardPct??0;let rankScore=spark;if(mode==="heating")rankScore=spark+Math.max(0,accel)*.65+percentile*.2+hazard*.2+(tier==="awakening"?18:tier==="volatile"?10:0);if(mode==="cooling")rankScore=(100-spark)+Math.max(0,-accel)*1.1+(tier==="calm"?18:tier==="building"?10:0);if(mode==="flipped")rankScore=Math.max(0,120-coin.streakDays*25)+spark*.35;if(mode==="strongest")rankScore=spark+coin.confidencePct*.25+percentile*.15;return{coin,tier,score:spark,rankScore,reason:reason(coin,mode)}});
 if(mode==="heating")return ranked.filter(r=>(r.coin.volatilityAccelerationPct??0)>0||r.tier==="awakening"||r.tier==="volatile").sort((a,b)=>b.rankScore-a.rankScore);
 if(mode==="cooling")return ranked.filter(r=>(r.coin.volatilityAccelerationPct??0)<0||r.tier==="calm"||r.tier==="building").sort((a,b)=>b.rankScore-a.rankScore);
 if(mode==="flipped")return ranked.filter(r=>r.coin.streakDays<=3).sort((a,b)=>b.rankScore-a.rankScore);
 return ranked.sort((a,b)=>b.rankScore-a.rankScore);
}
