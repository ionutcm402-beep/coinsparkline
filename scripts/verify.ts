// Verification script: loads the real coin price CSVs used throughout the
// Python prototype, runs them through the ported TypeScript regime model,
// and compares the results against the Python-verified ground truth
// established earlier in the project. Run with: npx tsx scripts/verify.ts

import * as fs from "fs";
import { fitRegime, PricePoint } from "../lib/regimeModel";

function loadCsv(path: string): PricePoint[] {
  const raw = fs.readFileSync(path, "utf-8");
  const lines = raw.trim().split("\n");
  const points: PricePoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const dateStr = cols[0].replace(" UTC", "").replace(" ", "T");
    const close = parseFloat(cols[1]);
    if (isNaN(close)) continue;
    points.push({ date: dateStr, close });
  }
  return points;
}

interface Expected {
  state: "calm" | "volatile";
  streakDays: number;
  tolerance: number; // allow +/- N days given algorithmic differences between hmmlearn and this port
}

const cases: { name: string; file: string; expected: Expected }[] = [
  { name: "BTC", file: "/home/claude/btc-usd-max.xls", expected: { state: "calm", streakDays: 183, tolerance: 3 } },
  { name: "ETH", file: "/home/claude/eth-usd-max.xls", expected: { state: "volatile", streakDays: 1, tolerance: 2 } },
  { name: "SOL", file: "/home/claude/sol-usd-max.xls", expected: { state: "calm", streakDays: 186, tolerance: 5 } },
  { name: "SUI", file: "/home/claude/sui-usd-max.xls", expected: { state: "calm", streakDays: 90, tolerance: 3 } },
  { name: "FIRO", file: "/home/claude/firo-usd-max.xls", expected: { state: "calm", streakDays: 18, tolerance: 3 } },
];

let allPassed = true;

for (const { name, file, expected } of cases) {
  const prices = loadCsv(file);
  const fit = fitRegime(prices);

  if (!fit) {
    console.log(`${name.padEnd(6)} FAILED -- could not fit (insufficient data)`);
    allPassed = false;
    continue;
  }

  const actualState = fit.currentState === 0 ? "calm" : "volatile";
  const stateMatch = actualState === expected.state;
  const streakDiff = Math.abs(fit.streakDays - expected.streakDays);
  const streakMatch = streakDiff <= expected.tolerance;
  const pass = stateMatch && streakMatch;
  if (!pass) allPassed = false;

  console.log(
    `${name.padEnd(6)} state=${actualState.padEnd(9)} streak=${String(fit.streakDays).padStart(4)}d ` +
      `(expected ${expected.state}, ${expected.streakDays}d ±${expected.tolerance})  ` +
      `confidence=${(fit.confidence * 100).toFixed(1)}%  -> ${pass ? "PASS" : "FAIL"}`
  );
}

console.log();
console.log(allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED");
process.exit(allPassed ? 0 : 1);
