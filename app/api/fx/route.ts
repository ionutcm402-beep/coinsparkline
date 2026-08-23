import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=GBP,EUR", {
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error(`FX provider returned ${response.status}`);
    const data = await response.json();

    return NextResponse.json({
      base: "USD",
      rates: {
        GBP: Number(data.rates?.GBP),
        EUR: Number(data.rates?.EUR),
      },
      date: data.date,
    });
  } catch {
    return NextResponse.json(
      { base: "USD", rates: { GBP: 0.78, EUR: 0.85 }, fallback: true },
      { status: 200 }
    );
  }
}
