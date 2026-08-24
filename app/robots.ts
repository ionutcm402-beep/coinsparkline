import type {MetadataRoute} from "next";

export default function robots():MetadataRoute.Robots{
 return {
  rules:[{userAgent:"*",allow:"/",disallow:["/api/","/signin","/signup","/watchlist","/portfolio","/alerts"]}],
  sitemap:"https://coinsparkline.vercel.app/sitemap.xml",
  host:"https://coinsparkline.vercel.app"
 };
}
