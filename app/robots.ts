import type {MetadataRoute} from "next";

const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://coinsparkline.vercel.app").replace(/\/$/,"");
export default function robots():MetadataRoute.Robots{
 return {
  rules:[{userAgent:"*",allow:"/",disallow:["/api/","/signin","/signup","/signals","/watchlist","/portfolio","/alerts"]}],
  sitemap:`${base}/sitemap.xml`,
  host:base
 };
}
