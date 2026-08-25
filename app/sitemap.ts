import type {MetadataRoute} from "next";

const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://coinsparkline.vercel.app").replace(/\/$/,"");
const routes=["/crypto","/nft","/risk","/privacy","/terms","/cookies","/disclaimer"];

export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 return routes.map((path)=>({
  url:`${base}${path}`,
  lastModified:now,
  changeFrequency:path==="/crypto"||path==="/nft"?"hourly":"monthly",
  priority:path==="/crypto"?1:path==="/nft"?0.9:0.5
 }));
}
