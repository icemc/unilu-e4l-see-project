// VerticalEnergyBatteryCounter.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Trans } from "react-i18next";

export default function VerticalEnergyBatteryCounter({
  value = 0,
  max = 3000,
  height = 136,
  width = 54,
  duration = 1800,
  coreColor = "#ffd94a",
  coreColorBottom = "#f6b800",
  particleCount = 9,
  particleMinMs = 1600,
  particleMaxMs = 2600,
  label = "energy scores calculated",
  shell = "metal", // "metal" | "dark" | custom
  orientation = "vertical",       // NEW: "vertical" | "horizontal"
    waveFrontColor = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)? "rgba(145, 115, 1,1)": "rgba(250, 213, 75,1)",
    waveBackColor  = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)  ? "rgba(145, 115, 1,1)" :"rgba(250, 213, 100,1)",
    meniscusOpacity = 1, // 0..1
}) {
  const [display, setDisplay] = useState(0);
  const [pct, setPct] = useState(0);
  const raf = useRef();

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const clampVal = Math.max(0, Math.min(value, max));
    const loop = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(clampVal * e));
      setPct(((clampVal / max) * 100) * e);
      if (k < 1) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [value, max, duration]);

  const w = width - 4;      // inner svg width
  const h = height - 14;    // inner svg height (space for terminal)
  const innerH = h - 4;
  const levelPx = (pct / 100) * innerH;

  const shellStyle = useMemo(() => {
    if (shell === "dark") {
      return { borderColor: "rgba(255,255,255,0.28)", bg: "linear-gradient(180deg,#2b3036,#1f2328)" };
    }
    if (shell === "metal") {
      return { borderColor: "rgba(0,0,0,0.28)", bg: "linear-gradient(180deg,#fbfcfe,#e7ebf1)" };
    }
    return { borderColor: shell, bg: shell };
  }, [shell]);

  const particles = useMemo(() => {
    const N = Math.max(3, Math.min(14, particleCount));
    return Array.from({ length: N }).map((_, i) => {
      const x = 6 + ((i * 13) % (w - 12));
      const delay = (i * 180) % 1500;
      const dur = (particleMinMs + ((i * 97) % (particleMaxMs - particleMinMs)));
      const scale = 0.65 + (i % 5) * 0.08;
      return { id: i, x, delay, dur, scale };
    });
  }, [particleCount, particleMinMs, particleMaxMs, w]);


 // replace your wavePath memo with this
const wavePath = useMemo(() => {
  const A = Math.max(2, Math.min(4, h * 0.03));
  const Y = Math.max(10, Math.min(14, h * 0.12));
  const step = Math.max(6, Math.floor(w / 10));
  let d = `M 0 ${Y}`;
  for (let x = 0; x <= 2 * w; x += step) {
    const y = Y + A * Math.sin((Math.PI * 2 * x) / w);
    d += ` L ${x} ${y}`;
  }
  // close far below surface to ensure fill coverage
  d += ` L ${2 * w} ${h + 12} L 0 ${h + 12} Z`;
  return d;
}, [w, h]);


  return (
    <div
      className={`vebc vebc--rounded ${orientation === "horizontal" ? "vebc--h" : ""}`}
      style={{ "--w": `${width+3}px`, "--h": `${height}px` }}
    >
      {/* Battery (cap + body) goes inside the rotor so only it rotates */}
      <div className="vebc__rotorBox">
        <div className="vebc__rotor">
          <div className="vebc__terminal" />
          <div
            className="vebc__body"
            style={{ borderColor: shellStyle.borderColor, background: shellStyle.bg }}
            role="img"
            aria-label={`Battery at ${Math.round(pct)} percent`}
            title={`Battery level: ${Math.round(pct)}% (max ${max.toLocaleString("en-US")})`}
          >
            <div className="vebc__sheen" />
            <svg
              className="vebc__svg"
              width={w}
              height={h}
              viewBox={`0 0 ${w} ${h}`}
              preserveAspectRatio="none"
            >
              <defs>
                <clipPath id="vebc_clip">
                  <rect x="0" y="0" width={w} height={h} rx={Math.min(w/2, 14)} ry={Math.min(w/2, 14)} />
                </clipPath>

                <linearGradient id="vebc_plasma" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={coreColor} />
                  <stop offset="100%" stopColor={coreColorBottom} />
                </linearGradient>

                <radialGradient id="vebc_glow" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>

//                    <path id="vebc_rimPath" d={`M0,18 C ${w*0.25},13 ${w*0.75},23 ${w},18 L${w},34 L0,34 Z`} />


                <path id="vebc_bolt" d="M0,0 L4,-6 L2,-6 L6,-12 L4,-7 L6,-7 Z" />
              </defs>

              <rect x="0" y="0" width={w} height={h} fill="url(#vebc_bg)" clipPath="url(#vebc_clip)" />
              <defs>
                <linearGradient id="vebc_bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f6f7fb" />
                  <stop offset="100%" stopColor="#eef1f6" />
                </linearGradient>
              </defs>

              <g clipPath="url(#vebc_clip)" transform={`translate(0, ${innerH - levelPx})`}>
               {/* <rect x="0" y="-2" width={w} height={h+8} fill="url(#vebc_plasma)" />*/}

{/* base plasma */}

                {/* BACK wave group (tiled; slower) */}
                <g transform="translate(0,2)" opacity="0.45" style={{ mixBlendMode: "screen" }}>
                  <g>
                    {/* two tiles: second shifted by +w */}
                    <path d={wavePath} fill={waveBackColor} />
                    <path d={wavePath} fill={waveBackColor} transform={`translate(${w},0)`} />
                    {/* slide container 0 → -w */}
                    <animateTransform attributeName="transform" type="translate"
                      from={`0 2`} to={`-${w} 2`} dur="2s" repeatCount="indefinite" />
                    {/* gentle bob (additive) */}
                    <animateTransform attributeName="transform" type="translate" additive="sum"
                      values={`0 0; 0 1; 0 0; 0 -1`} keyTimes="0;0.33;0.66;1"
                      dur="3.6s" repeatCount="indefinite" />
                  </g>
                </g>

                {/* FRONT wave group (tiled; a bit faster/stronger) */}
                <g transform="translate(0,0)" opacity="0.85" style={{ mixBlendMode: "screen" }}>
                  <g>
                    <path d={wavePath} fill={waveFrontColor} />
                    <path d={wavePath} fill={waveFrontColor} transform={`translate(${w},0)`} />
                    <animateTransform attributeName="transform" type="translate"
                      from={`-${w/2} 0`} to={`-${w + w/2} 0`} dur="6s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="translate" additive="sum"
                      values={`0 0; 0 0.5; 0 0; 0 -0.5`} keyTimes="0;0.33;0.66;1"
                      dur="3s" repeatCount="indefinite" />
                  </g>
                </g>

                {/* meniscus glow (single) */}
                <rect x="0" y="-6" width={w} height="22" fill="url(#vebc_glow)" style={{ mixBlendMode: "screen", opacity: meniscusOpacity }} />
//                <rect x="0" y="-8" width={w} height="34" fill="url(#vebc_glow)" style={{ mixBlendMode: "screen" }} />
                                  {particles.map(p => (
                                    <use
                                      key={p.id}
                                      href="#vebc_bolt"
                                      className="vebc__bolt"
                                      x={p.x}
                                      y={h}
                                      style={{ animationDelay: `${p.delay}ms`, animationDuration: `${p.dur}ms` }}
                                      fill="rgba(255,255,255,0.9)"
                                      transform={`scale(${p.scale})`}
                                    />
                                  ))}

              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* readout (keeps upright) */}
      <div className="vebc__text">
        <div className="vebc__value">{display.toLocaleString("en-US")}</div>
        <div className="vebc__label"><Trans i18nKey="new-changes.energyScores"/></div>
        <div className="vebc__sub"><Trans i18nKey="new-changes.moreToS" /></div>
      </div>
    </div>
  );
}
