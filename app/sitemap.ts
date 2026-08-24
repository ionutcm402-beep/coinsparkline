import type {MetadataRoute} from "next";

const base="https://coinsparkline.vercel.app";
const routes=["/","/live","/opportunities","/screener","/compare","/privacy-coins","/nft","/school","/school/what-is-crypto","/methodology","/about","/risk","/privacy","/terms","/cookies","/disclaimer"];

export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 return routes.map((path)=>({url:`${base}${path}`,lastModified:now,changeFrequency:path==="/"||path==="/live"?"hourly":path==="/opportunities"||path==="/screener"||path==="/compare"||path==="/privacy-coins"?"daily":"monthly",priority:path==="/"?1:path==="/opportunities"||path==="/screener"||path==="/compare"?0.8:0.6}));
}
