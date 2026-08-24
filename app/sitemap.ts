import type {MetadataRoute} from "next";

const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://coinsparkline.vercel.app").replace(/\/$/,"");
const routes=["/","/radar","/nft","/school","/school/what-is-crypto","/methodology","/about","/risk","/privacy","/terms","/cookies","/disclaimer"];

export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 return routes.map((path)=>({url:`${base}${path}`,lastModified:now,changeFrequency:path==="/"?"hourly":path==="/radar"||path==="/nft"?"daily":"monthly",priority:path==="/"?1:path==="/radar"?0.9:path==="/nft"?0.7:0.6}));
}
