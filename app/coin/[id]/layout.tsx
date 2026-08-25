import type { ReactNode } from "react";
import type {Metadata} from "next";
import {routeMetadata} from "@/lib/seo";

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const{id}=await params;const name=id.split("-").map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(" ");
 return routeMetadata(`${name} market behaviour`, `Research ${name} with SparkScore, regime intelligence, historical context and market structure.`, `/coin/${encodeURIComponent(id)}`);
}

export default function CoinDetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
