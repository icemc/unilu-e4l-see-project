// src/js/container/HeartParticlesButton.jsx
import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
const SVG_NS = "http://www.w3.org/2000/svg";

export default function HeartParticlesButton({
  children,
  onClick,
  color = "#bd1128",
  className = "btn-accent",
  style,
  /** particles per second while hovering */
  rate = 16,
  /** optional one-time burst when pointer enters */
  burstOnEnter = 6,
  /** motion tuning */
  spread = 90,
  durationMin = 700,
  durationMax = 1200,
  sizeMin = 10,
  sizeMax = 20,
  /** safety cap to avoid DOM buildup */
  maxParticlesInDOM = 80,
}) {
  const hostRef = useRef(null);
  const timerRef = useRef(null);
  const hoveringRef = useRef(false);

  // clear interval on unmount
  useEffect(() => () => stop(), []);

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeHeart() {
    const host = hostRef.current;
    if (!host) return;

    // soft cap: if too many still alive, skip this tick
    if (host.childElementCount > maxParticlesInDOM) return;

    // random polar offset
    const angle = Math.random() * Math.PI * 2;
    const radius = (0.35 + Math.random() * 0.65) * spread;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius * 0.85;

    const size = rand(sizeMin, sizeMax);
    const rot = (Math.random() * 60 - 30).toFixed(2) + "deg";
    const dur = rand(durationMin, durationMax);

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("class", "heart-particle");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute(
      "d",
      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4 8.24 4 9.91 5.01 10.72 6.53 11.53 5.01 13.2 4 14.94 4 17.43 4 19.5 6 19.5 8.5c0 3.78-3.4 6.86-8.05 11.54L12 21.35z"
    );
    path.setAttribute("fill", color);
    path.setAttribute("fill-opacity", "0.95");
    svg.appendChild(path);

    svg.style.setProperty("--dx", `${dx}px`);
    svg.style.setProperty("--dy", `${dy}px`);
    svg.style.setProperty("--rot", rot);
    svg.style.setProperty("--scale", (0.7 + Math.random() * 0.7).toFixed(2));
    svg.style.setProperty("--dur", `${dur}ms`);

    svg.addEventListener("animationend", () => svg.remove());
    host.appendChild(svg);
  }

  function burst(n = burstOnEnter) {
    for (let i = 0; i < n; i++) makeHeart();
  }

  function start() {
    if (timerRef.current || rate <= 0) return;
    const interval = Math.max(1000 / rate, 16); // cap to ~60fps
    timerRef.current = setInterval(() => {
      // small variability: sometimes emit 2 in a tick
      makeHeart();
      if (Math.random() < 0.25) makeHeart();
    }, interval);
  }

  function stop() {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function handleEnter() {
    hoveringRef.current = true;
    if (burstOnEnter > 0) burst(burstOnEnter);
    start();
  }
  function handleLeave() {
    hoveringRef.current = false;
    stop();
  }

  return (
    <span className="heart-container" ref={hostRef}>
    <Link to="/seminarHome">
      <p
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        onClick={onClick}
      >
        {children}
      </p>
      </Link>
    </span>
  );
}
