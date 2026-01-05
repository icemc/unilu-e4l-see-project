// BatteryMeter.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function BatteryMeter({
  segments = [],          // [{ id: 'qName', label: 'Transport', value: 12.3, color: '#...' }]
  maxValue = 100,
  worldAvg,
  totalLabel,
  compact = false,
  minSegmentPx = 36,      // NEW: minimum visible width per segment (px)
  dangerIfAbove = 120,   // NEW: trigger threshold
  dangerIntensity = 0.6, // NEW: 0..1 controls effect strength
}) {
  const total = Math.max(
    0,
    Math.min(maxValue, segments.reduce((s, x) => s + (Number(x.value) || 0), 0))
  );

  const normalized = useMemo(() => {
    const clamp = (n) => Math.max(0, Math.min(n, maxValue));
    return segments.map((seg) => {
      const widthPct = (clamp(Number(seg.value) || 0) / maxValue) * 100;
      return { ...seg, widthPct };
    });
  }, [segments, maxValue]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, [segments, maxValue]);

  const isDanger = typeof dangerIfAbove === "number" && total > dangerIfAbove;


  return (
       <div
         className={`battery ${compact ? "battery--compact" : ""} ${isDanger ? "battery--danger" : ""}`}
         style={isDanger ? { ["--danger-intensity"]: dangerIntensity } : undefined}
       >
      <div className="battery__body">
        <div className="battery__fill">
          {normalized.map((seg, i) => (
            <div
              key={seg.id || seg.label}                 // STABLE KEY
              className="battery__seg"
              style={{
                width: mounted ? `max(${seg.widthPct}%, var(--minw))` : 0, // MIN WIDTH
                animationDelay: `${i * 60}ms`,
                background: seg.color || "var(--seg, #3aa3ff)",
                // expose min width as CSS var for calc()
                ["--minw"]: `${minSegmentPx}px`,
              }}
              title={`${seg.label}: ${formatNumber(seg.value)} kWh/day`}     // HOVER
              aria-label={`${seg.label}: ${formatNumber(seg.value)} kWh per day`}
            >
              {seg.widthPct > 7 || minSegmentPx >= 30 ? (
                <span className="battery__segLabel">
                  {formatNumber(seg.value)}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {typeof worldAvg === "number" && worldAvg > 0 && (
          <div
            className="battery__marker"
            style={{ left: `${Math.min(100, (worldAvg / maxValue) * 100)}%` }}
            title={`Europe average: ${formatNumber(worldAvg)} kWh/day`}
          />
        )}
      </div>
      <div className="battery__cap" />
      {totalLabel && (
        <div className="battery__footer" aria-live="polite">
          <b>{totalLabel}</b>
          {typeof worldAvg === "number" && (
            <span className="battery__footerAvg">
              &nbsp;· Europe avg: {formatNumber(worldAvg)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return "0";
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
