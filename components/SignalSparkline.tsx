// A tiny inline sparkline representing recent SIGNAL history (calm/volatile
// per day), not raw price -- each bar is colored by that day's regime state.
export default function SignalSparkline({ states }: { states: number[] }) {
  if (!states || states.length === 0) return null;

  return (
    <div className="flex h-4 items-end gap-[1.5px]" aria-hidden="true">
      {states.map((state, i) => (
        <div
          key={i}
          className="w-[3px] flex-1 rounded-sm"
          style={{
            height: "100%",
            backgroundColor: state === 0 ? "#a5d8ff" : "#ffc9c9",
          }}
        />
      ))}
    </div>
  );
}
