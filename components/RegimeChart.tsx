"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartPoint {
  date: string;
  close: number;
  state: number; // 0 = calm, 1 = volatile
}

type Timeframe = "1M" | "3M" | "6M" | "1Y" | "ALL";
const TIMEFRAME_DAYS: Record<Timeframe, number | null> = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365, ALL: null };

function splitIntoSegments(points: ChartPoint[]) {
  const segments: { state: number; data: { x: number; y: number }[] }[] = [];
  let current: { x: number; y: number }[] = [];
  let currentState = points[0]?.state;

  points.forEach((p, i) => {
    const x = new Date(p.date).getTime();
    if (p.state !== currentState) {
      current.push({ x, y: p.close });
      segments.push({ state: currentState, data: current });
      current = [{ x, y: p.close }];
      currentState = p.state;
    } else {
      current.push({ x, y: p.close });
    }
    if (i === points.length - 1 && current.length > 0) segments.push({ state: currentState, data: current });
  });
  return segments;
}

function compactDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RegimeChart({ points }: { points: ChartPoint[] }) {
  const [timeframe, setTimeframe] = useState<Timeframe>("ALL");

  const filteredPoints = useMemo(() => {
    const days = TIMEFRAME_DAYS[timeframe];
    if (!days) return points;
    const cutoff = Date.now() - days * 86400000;
    return points.filter((p) => new Date(p.date).getTime() >= cutoff);
  }, [points, timeframe]);

  const segments = useMemo(() => splitIntoSegments(filteredPoints), [filteredPoints]);

  const summary = useMemo(() => {
    if (!filteredPoints.length) return { calmPct: 0, volatilePct: 0, flips: 0, lastFlip: null as ChartPoint | null };
    const calm = filteredPoints.filter((p) => p.state === 0).length;
    let flips = 0;
    let lastFlip: ChartPoint | null = null;
    for (let i = 1; i < filteredPoints.length; i++) {
      if (filteredPoints[i].state !== filteredPoints[i - 1].state) {
        flips++;
        lastFlip = filteredPoints[i];
      }
    }
    return {
      calmPct: Math.round((calm / filteredPoints.length) * 100),
      volatilePct: Math.round(((filteredPoints.length - calm) / filteredPoints.length) * 100),
      flips,
      lastFlip,
    };
  }, [filteredPoints]);

  const recent = useMemo(() => points.slice(-30), [points]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Price &amp; signal history</p>
          <p className="mt-1 text-xs text-slate-400">Blue = Calm · Red = Volatile · regime changes are model state changes, not buy/sell calls.</p>
        </div>
        <div className="flex w-full gap-1 overflow-x-auto rounded-xl bg-slate-50 p-1 sm:w-auto">
          {(Object.keys(TIMEFRAME_DAYS) as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={tf === timeframe
                ? "min-w-11 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 shadow-sm"
                : "min-w-11 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-white hover:text-slate-700"}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-blue-50/70 px-3 py-3"><p className="text-[10px] uppercase tracking-[0.1em] text-blue-500">Calm time</p><p className="mt-1 text-lg font-bold text-blue-700">{summary.calmPct}%</p></div>
        <div className="rounded-xl bg-rose-50/70 px-3 py-3"><p className="text-[10px] uppercase tracking-[0.1em] text-rose-500">Volatile time</p><p className="mt-1 text-lg font-bold text-rose-700">{summary.volatilePct}%</p></div>
        <div className="rounded-xl bg-slate-50 px-3 py-3"><p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Flips</p><p className="mt-1 text-lg font-bold text-slate-800">{summary.flips}</p></div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="x"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", year: "2-digit" })}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={{ stroke: "#e5e7eb" }}
            allowDuplicatedCategory={false}
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v.toLocaleString()}`}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={{ stroke: "#e5e7eb" }}
            width={70}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]}
            labelFormatter={(v) => new Date(Number(v)).toLocaleDateString()}
            contentStyle={{ fontSize: 12, borderRadius: 12, border: "1px solid #e5e7eb" }}
          />
          {segments.map((seg, i) => (
            <Line key={i} data={seg.data} dataKey="y" type="monotone" stroke={seg.state === 0 ? "#4c6ef5" : "#d6336c"} strokeWidth={2.25} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50/65 p-4">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">30-day signal map</p><p className="mt-1 text-xs text-slate-500">Each block represents one observed day.</p></div>
          {summary.lastFlip && <p className="shrink-0 text-right text-[10px] text-slate-400">Last flip<br/><strong className="text-slate-600">{compactDate(summary.lastFlip.date)}</strong></p>}
        </div>
        <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(recent.length, 1)}, minmax(0, 1fr))` }}>
          {recent.map((p, i) => (
            <div key={`${p.date}-${i}`} title={`${new Date(p.date).toLocaleDateString()} · ${p.state === 0 ? "Calm" : "Volatile"}`} className={`h-8 rounded-[4px] ${p.state === 0 ? "bg-blue-500" : "bg-rose-500"}`} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[9px] text-slate-400"><span>{recent[0] ? compactDate(recent[0].date) : ""}</span><span>Today</span></div>
      </div>
    </div>
  );
}
