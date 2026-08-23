import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import FlowingLines from "@/components/FlowingLines";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import CookieConsent from "@/components/CookieConsent";
import CoinPageWatchlistDock from "@/components/CoinPageWatchlistDock";

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://coinsparkline.com";
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:"CoinSparkLine — Track the calm. Catch the move.",template:"%s | CoinSparkLine"},description:"Crypto behavioural intelligence for discovering volatility regime changes, SparkScore activity and assets changing behaviour now.",applicationName:"CoinSparkLine",keywords:["crypto volatility","crypto market regimes","SparkScore","crypto signals","Spark Radar"],alternates:{canonical:"/"},openGraph:{type:"website",siteName:"CoinSparkLine",title:"CoinSparkLine — Track the calm. Catch the move.",description:"Discover which crypto assets are changing behaviour now.",url:"/"},twitter:{card:"summary_large_image",title:"CoinSparkLine — Track the calm. Catch the move.",description:"Behavioural crypto intelligence for volatility regime changes."},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en" className="h-full"><body className="csl-app min-h-full flex flex-col antialiased"><CurrencyProvider><FlowingLines/>{children}<CoinPageWatchlistDock/><CookieConsent/></CurrencyProvider></body></html>}
