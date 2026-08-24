export type MarketAssetClass="crypto"|"nft"|"fx"|"commodity"|"stock";
export type BehaviourStatus="validated"|"experimental"|"unavailable";
export type MarketRegime="calm"|"building"|"awakening"|"volatile"|null;

export interface MarketSignal{
 id:string;
 assetClass:MarketAssetClass;
 symbol:string;
 name:string;
 price:number|null;
 unit?:string|null;
 change24hPct:number|null;
 sparkScore:number|null;
 regime:MarketRegime;
 confidencePct:number|null;
 behaviourStatus:BehaviourStatus;
 activityScore?:number|null;
 imageUrl?:string|null;
 source:string;
 updatedAt?:string|null;
 metadata?:Record<string,string|number|boolean|null>;
}
