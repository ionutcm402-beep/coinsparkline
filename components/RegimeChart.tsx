"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ChartPoint {
  date: string;
  close: number;
  state: number; // 0 = calm, 1 = volatile
}

export default function RegimeChart({ points }: { points: ChartPoint[] }) {
  const data = points.map((p) => ({
    x: new Date(p.date).getTime(),
    y: p.close,
    state: p.state,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="x"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", year: "2-digit" })}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={{ stroke: "#e5e7eb" }}
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
        <Scatter data={data} shape="circle">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.state === 0 ? "#4c6ef5" : "#d6336c"} r={2.5} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
