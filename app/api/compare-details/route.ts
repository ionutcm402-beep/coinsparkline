import {NextRequest,NextResponse} from "next/server";
import {fetchCoinDetails,fetchPriceHistory} from "@/lib/coingecko";
import {fitRegime} from "@/lib/regimeModel";
import {buildSparkHistory} from "@/lib/sparkHistory";

export const maxDuration=60;

type Point={date:string;close:number};
function pctReturn(points:Point[],days:number){if(points.length<2)return null;const end=points[points.length-1].close;const target=Date.now()-days*86400000;let start=points[0];for(const p of points){if(new Date(p.date).getTime()>=target){start=p;break}}return start.close?((end-start.close)/start.close)*100:null}
function annualizedVol(points:Point[],days=90){const cutoff=Date.now()-days*86400000;const xs=points.filter(p=>new Date(p.date).getTime()>=cutoff);if(xs.length<3)return null;const r:number[]=[];for(let i=1;i<xs.length;i++)if(xs[i-1].close>0&&xs[i].close>0)r.push(Math.log(xs[i].close/xs[i-1].close));if(r.length<2)return null;const mean=r.reduce((a,b)=>a+b,0)/r.length;const variance=r.reduce((s,x)=>s+(x-mean)**2,0)/(r.length-1);return Math.sqrt(variance)*Math.sqrt(365)*100}

export async function GET(req:NextRequest){
 const ids=(req.nextUrl.searchParams.get("ids")||"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,3);
 if(!ids.length)return NextResponse.json({items:[]});
 const apiKey=process.env.COINGECKO_API_KEY;
 const items=await Promise.all(ids.map(async id=>{
   try{
    const[history,details]=await Promise.all([fetchPriceHistory(id,365,apiKey),fetchCoinDetails(id,apiKey)]);
    const fit=fitRegime(history.map(p=>({date:p.date,close:p.close})));
    const displayName=id.charAt(0).toUpperCase()+id.slice(1).replace(/-/g," ");
    const symbol=details?.symbol||id.slice(0,5).toUpperCase();
    const spark=fit?buildSparkHistory(fit,id,displayName,symbol):[];
    const current=details?.currentPrice??history.at(-1)?.close??null;
    const ath=details?.ath??null;
    return {id,current,ath,athDistancePct:current!=null&&ath&&ath>0?((current/ath)-1)*100:null,return30:pctReturn(history,30),return90:pctReturn(history,90),return365:pctReturn(history,365),volatility90:annualizedVol(history,90),sparkHistory:spark.map(p=>({date:p.date,score:p.score}))};
   }catch{return{id,error:true}}
 }));
 return NextResponse.json({items},{headers:{"Cache-Control":"public, s-maxage=900, stale-while-revalidate=1800"}});
}
