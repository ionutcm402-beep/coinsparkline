import type {ReactNode} from "react";
import {routeMetadata} from "@/lib/seo";

export const metadata=routeMetadata("Privacy Intelligence","Compare privacy-focused crypto assets by privacy model, technology and current CoinSparkLine market behaviour.","/privacy-coins");
export default function PrivacyCoinsLayout({children}:{children:ReactNode}){
 return <div className="cs-secondary cs-secondary--privacy">{children}</div>;
}
