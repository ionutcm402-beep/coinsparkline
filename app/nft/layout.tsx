import type {ReactNode} from "react";
import {routeMetadata} from "@/lib/seo";

export const metadata=routeMetadata("NFT Radar","Research NFT collection activity through volume, floor, sales and marketplace context.","/nft");
export default function NftLayout({children}:{children:ReactNode}){
 return <div className="cs-secondary cs-secondary--nft">{children}</div>;
}
