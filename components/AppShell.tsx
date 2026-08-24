import {ReactNode} from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Coin} from "@/types/coin";

export default function AppShell({children,coins=[]}:{children:ReactNode;coins?:Coin[]}){
 return <div className="csl-app-shell"><a className="csl-skip-link" href="#main-content">Skip to content</a><Header coins={coins}/><main id="main-content" className="csl-app-main" tabIndex={-1}>{children}</main><Footer/></div>;
}
