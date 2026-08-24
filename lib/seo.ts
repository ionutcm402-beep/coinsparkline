import type {Metadata} from "next";

export function routeMetadata(title:string,description:string,path:string,options?:{noIndex?:boolean}):Metadata{
 return {
  title,
  description,
  alternates:{canonical:path},
  openGraph:{title:`${title} | CoinSparkLine`,description,url:path},
  twitter:{title:`${title} | CoinSparkLine`,description},
  robots:options?.noIndex?{index:false,follow:false}:undefined
 };
}
