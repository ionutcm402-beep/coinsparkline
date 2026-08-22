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

// Split a chronological point list into contiguous same-state runs, each
// segment overlapping its neighbor by one point so the colored line
// segments connect visually with no gap between them.
function splitIntoSegments(points: ChartPoint[]) {
  const segments: { state: number; data: { x: number; y: number }[] }[] = [];
  let current: { x: number; y: number }[] = [];
  let currentState = points[0]?.state;

  points.forEach((p, i) => {
    const x = new Date(p.date).getTime();
    if (p.state !== currentState) {
      // close out the previous segment, include this point too so lines touch
      current.push({ x, y: p.close });
      segments.push({ state: currentState, data: current });
      current = [{ x, y: p.close }];
      currentState = p.state;
    } else {
      current.push({ x, y: p.close });
    }
    if (i === points.length - 1 && current.length > 0) {
      segments.push({ state: currentState, data: current });
    }
  });
  return segments;
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

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Price &amp; market regime</p>
          <p className="text-xs text-gray-400">Blue = Calm &middot; Red = Volatile</p>
        </div>
        <div className="flex gap-1">
          {(Object.keys(TIMEFRAME_DAYS) as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={
                tf === timeframe
                  ? "rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                  : "rounded-md px-2 py-1 text-xs text-gray-400 hover:bg-gray-50"
              }
            >
              {tf}
            </button>
          ))}
        </div>
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
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
          {segments.map((seg, i) => (
            <Line
              key={i}
              data={seg.data}
              dataKey="y"
              type="monotone"
              stroke={seg.state === 0 ? "#4c6ef5" : "#d6336c"}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
