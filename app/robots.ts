import type {MetadataRoute} from "next";
const base=(process.env.NEXT_PUBLIC_SITE_URL||"https://coinsparkline.vercel.app").replace(/\/$/,"");
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:"*",allow:["/crypto","/nft","/methodology","/risk","/privacy","/terms","/cookies","/disclaimer"],disallow:["/api/","/signin","/signup","/forgot-password","/reset-password","/portfolio"]}],sitemap:`${base}/sitemap.xml`,host:base}}
