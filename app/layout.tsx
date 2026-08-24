import type {Metadata,Viewport} from "next";
import "./globals.css";
import "./csl2.css";
import "../styles/design-system.css";
import "../styles/ui-primitives.css";
import "../styles/homepage.css";
import "../styles/live-page.css";
import FlowingLines from "@/components/FlowingLines";
import {CurrencyProvider} from "@/components/CurrencyProvider";
import CookieConsent from "@/components/CookieConsent";
import CoinPageWatchlistDock from "@/components/CoinPageWatchlistDock";
import PWARegister from "@/components/PWARegister";
import MobileDock from "@/components/MobileDock";
export const metadata:Metadata={title:"CoinSparkLine — See the market before it feels obvious.",description:"A clearer way to see crypto market behaviour, momentum and regime change.",manifest:"/manifest.webmanifest",applicationName:"CoinSparkLine",appleWebApp:{capable:true,title:"CoinSparkLine",statusBarStyle:"default"},icons:{icon:"/pwa-icon.svg",apple:"/pwa-icon.svg"},formatDetection:{telephone:false}};
export const viewport:Viewport={themeColor:"#2563eb",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:LayoutProps<"/">){return <html lang="en" className="h-full"><body className="csl-app min-h-full flex flex-col antialiased pb-20 md:pb-0"><CurrencyProvider><FlowingLines/>{children}<CoinPageWatchlistDock/><MobileDock/><PWARegister/><CookieConsent/></CurrencyProvider></body></html>}
