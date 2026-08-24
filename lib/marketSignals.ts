import type {Coin} from "@/types/coin";
import type {MarketSignal} from "@/types/market";
import type {NftCollection} from "@/lib/nftData";
import {getSignalTier} from "@/lib/tiers";
import {getSparkScore} from "@/lib/sparkScore";

export function cryptoSignal(coin:Coin,updatedAt?:string|null):MarketSignal{
 return {id:coin.id,assetClass:"crypto",symbol:coin.symbol.toUpperCase(),name:coin.name,price:coin.price,unit:"USD",change24hPct:coin.change24hPct,sparkScore:getSparkScore(coin).score,regime:getSignalTier(coin),confidencePct:coin.confidencePct,behaviourStatus:"validated",imageUrl:coin.logoUrl||null,source:"CoinGecko + CoinSparkLine HMM",updatedAt:updatedAt||null,metadata:{category:coin.category,streakDays:coin.streakDays,medianDaysToFlip:coin.medianDaysToFlip}};
}

export function nftSignal(collection:NftCollection):MarketSignal{
 const day=collection.volume24h??0,week=collection.volume7d??0;const dailyShare=week>0?Math.min(100,(day/week)*100):null;const activity=dailyShare==null?null:Math.round(dailyShare);
 return {id:collection.id,assetClass:"nft",symbol:collection.slug.toUpperCase().slice(0,12),name:collection.name,price:collection.floor,unit:"ETH",change24hPct:null,sparkScore:null,regime:null,confidencePct:null,behaviourStatus:"unavailable",activityScore:activity,imageUrl:collection.image,source:"OpenSea",metadata:{chain:collection.chain,volume24h:collection.volume24h,volume7d:collection.volume7d,sales24h:collection.sales24h,marketplaceUrl:collection.marketplaceUrl}};
}
