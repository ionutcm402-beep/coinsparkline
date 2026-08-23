"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type DisplayCurrency = "USD" | "GBP" | "EUR";

const SYMBOLS: Record<DisplayCurrency, string> = {
  USD: "$",
  GBP: "£",
  EUR: "€",
};

type CurrencyContextValue = {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
  rate: number;
  symbol: string;
  convert: (usdValue: number) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>("USD");
  const [rates, setRates] = useState<Record<DisplayCurrency, number>>({ USD: 1, GBP: 0.78, EUR: 0.85 });

  useEffect(() => {
    const saved = window.localStorage.getItem("csl-currency") as DisplayCurrency | null;
    if (saved && ["USD", "GBP", "EUR"].includes(saved)) setCurrencyState(saved);

    fetch("/api/fx")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.rates?.GBP && data?.rates?.EUR) {
          setRates({ USD: 1, GBP: Number(data.rates.GBP), EUR: Number(data.rates.EUR) });
        }
      })
      .catch(() => undefined);
  }, []);

  const setCurrency = (next: DisplayCurrency) => {
    setCurrencyState(next);
    window.localStorage.setItem("csl-currency", next);
  };

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency,
    rate: rates[currency],
    symbol: SYMBOLS[currency],
    convert: (usdValue: number) => usdValue * rates[currency],
  }), [currency, rates]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used inside CurrencyProvider");
  return context;
}
