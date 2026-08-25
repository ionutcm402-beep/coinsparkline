import type {Metadata,Viewport} from "next";
import "./globals.css";
import "../styles/clean-2030.css";
import "../styles/clean-2030-extras.css";
import "../styles/coin-profile-2030.css";
import "../styles/auth-fixes.css";
import "../styles/launch-qa.css";
import {CurrencyProvider} from "@/components/CurrencyProvider";
import CookieConsent from "@/components/CookieConsent";
import MarketRiskWelcome from "@/components/MarketRiskWelcome";
const rawSiteUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://coinsparkline.vercel.app";
const siteUrl=rawSiteUrl.replace(/\/$/,"");
const description="CoinSparkLine shows crypto and NFT market movement through separate signal systems.";
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:"CoinSparkLine — Crypto & NFT movement",template:"%s | CoinSparkLine"},description,manifest:"/manifest.webmanifest",applicationName:"CoinSparkLine",icons:{icon:"/icon.svg",apple:"/pwa-icon.svg"},openGraph:{type:"website",siteName:"CoinSparkLine",url:siteUrl,title:"CoinSparkLine — Crypto & NFT movement",description,images:[{url:"/opengraph-image",width:1200,height:630,alt:"CoinSparkLine"}]},twitter:{card:"summary_large_image",title:"CoinSparkLine — Crypto & NFT movement",description,images:["/opengraph-image"]},formatDetection:{telephone:false}};
export const viewport:Viewport={themeColor:"#f5f7fb",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:LayoutProps<"/">){return <html lang="en"><body><CurrencyProvider>{children}<MarketRiskWelcome/><CookieConsent/></CurrencyProvider></body></html>}
