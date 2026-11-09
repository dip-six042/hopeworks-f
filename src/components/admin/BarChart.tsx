import React, { useMemo, useState } from 'react';

/**
 * Single-series daily bar chart (one hue, magnitude). No legend — the card title names the series.
 * Thin bars with a 2px gap, rounded tops anchored to the baseline, recessive axis, hover tooltip,
 * and a visually-hidden table for screen readers.
 */
export function BarChart({ data, format, label }: {
  data: { day: string; value: number }[];
  format: (n: number) => string;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = 160;
  const padTop = 12;
  const padBottom = 20;
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);
  const n = data.length || 1;
  const slot = W / n;
  const barW = Math.max(2, slot - 2); // 2px surface gap between bars
  const plotH = H - padTop - padBottom;
  const total = data.reduce((s, d) => s + d.value, 0);

  const fmtDay = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  if (total === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg">
        Nothing yet in the last 30 days
      </div>
    );
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" role="img" aria-label={`${label}, last 30 days, total ${format(total)}`}>
        {/* baseline + one recessive gridline at max */}
        <line x1={0} x2={W} y1={H - padBottom} y2={H - padBottom} stroke="#e2e8f0" strokeWidth={1} />
        <line x1={0} x2={W} y1={padTop} y2={padTop} stroke="#f1f5f9" strokeWidth={1} strokeDasharray="3 3" />
        <text x={W} y={padTop - 3} textAnchor="end" fontSize={10} fill="#94a3b8">{format(max)}</text>

        {data.map((d, i) => {
          const h = d.value > 0 ? Math.max(2, (d.value / max) * plotH) : 0;
          const x = i * slot + 1;
          const y = H - padBottom - h;
          const r = Math.min(4, barW / 2, h);
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* hit target larger than the mark */}
              <rect x={i * slot} y={0} width={slot} height={H - padBottom} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${H - padBottom} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${H - padBottom} Z`}
                  fill="#B24724"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
            </g>
          );
        })}

        {/* first / last day labels */}
        {data.length > 0 && (
          <>
            <text x={0} y={H - 5} fontSize={10} fill="#94a3b8">{fmtDay(data[0].day)}</text>
            <text x={W} y={H - 5} fontSize={10} fill="#94a3b8" textAnchor="end">{fmtDay(data[data.length - 1].day)}</text>
          </>
        )}
      </svg>

      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute -top-2 px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] whitespace-nowrap shadow"
          style={{ left: `${((hover + 0.5) / n) * 100}%`, transform: 'translate(-50%, -100%)' }}
        >
          {fmtDay(data[hover].day)}: <span className="font-semibold">{format(data[hover].value)}</span>
        </div>
      )}

      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}><th>{d.day}</th><td>{format(d.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
