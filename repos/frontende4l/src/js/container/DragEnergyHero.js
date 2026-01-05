// DragEnergyHero.jsx
import React, { useEffect, useRef, useState } from "react";
import Row from "react-bootstrap/Row";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import { fetchSessionCount, fetchIsCalculatedisabled, setKid } from "../action/questionnaireAction";
import { connect } from "react-redux";
import { VerticalSpace } from "../presentation/verticalSpace";
import exampleImage from "../../public/img/self.png";
import { Textfit } from "react-textfit";
import { Trans } from "react-i18next";
import { hideNavButton, showNavButton } from "../action/navAction";
import Collapse from "react-bootstrap/Collapse";
import Fade from "react-bootstrap/Fade";
import '../../css/home.css';
import ModePicker from "./ModePicker";
import CountUp from "react-countup";
import HeartParticlesButton from "./HeartParticlesButton";
import CalculatePillButton from "./CalculatePillButton";
import { RadialRevealButton } from "./RadialReveal"; // adjust the path to the canvas file
import VerticalEnergyBatteryCounter from "./ParticleBatteryCounter"; // adjust path
const SVG_NS = "http://www.w3.org/2000/svg";
import logoREG from '../../public/img/logo-reg.png'; // Import the cookie image


import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


/**
 * Full-bleed Arcadia-like hero with:
 * - springy draggable logo (no anime.js)
 * - emoji lightning particles while dragging
 * - slots to render your existing CTA (left) & battery (right-bottom)
 *
 * Theming: uses [data-theme="kid"] and [data-theme="adult-invert"] colors from CSS below.
 */
export default function DragEnergyHero({
  maxEnergy = 100,
  leftSlot,          // JSX for your CTA & mode chip
  rightBottomSlot,   // JSX for your battery counter
    size = "compact",                 // NEW: "compact" | "regular" | "large"
    fieldMax,                         // optional override (e.g., "360px")
    logoSize,                         // optional override (e.g., "90px")
    ctaWhenCharged,




      children,
      color = "#fcd200",
      className = "btn-accent",
      style,
      /** particles per second while hovering */
      rate = 3,
      /** optional one-time burst when pointer enters */
      burstOnEnter = 1,
      /** motion tuning */
      spread = 120,
      durationMin = 700,
      durationMax = 1200,
      sizeMin = 10,
      sizeMax = 20,
      /** safety cap to avoid DOM buildup */
      maxParticlesInDOM = 50,



}) {
  const fieldRef = useRef(null);
  const logoRef  = useRef(null);


    const hostRef = useRef(null);
    const timerRef = useRef(null);
    const hoveringRef = useRef(false);

    const velocity = useRef({ x: 0, y: 0 });



  const [energy, setEnergy] = useState(0);
  const energyRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [charged, setCharged] = useState(false);
  const [draggable, setDraggable] = useState(true);  // Track draggable state

  const history = useHistory();
  const dispatch = useDispatch();
  const questionnaireReducer = useSelector(state => state.questionnaireReducer);



  // drag state
  const dragging = useRef(false);
  const origin   = useRef({ x: 0, y: 0 });
  const target   = useRef({ x: 0, y: 0 });
  const current  = useRef({ x: 0, y: 0 });
  const lastMove = useRef({ x: 0, y: 0, t: 0 });

  // wave and bounce state
  const waveOffset = useRef(0);
  const bounceOffset = useRef(0);
  const lastDragSpeed = useRef(0);
    const returnDelay = useRef(null);


  // particles
  const [particles, setParticles] = useState([]);
  const particlesRef = useRef(particles);
  particlesRef.current = particles;
  const pid = useRef(0);


useEffect(() => {
  const checkMobile = () => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    console.log("MOB: ", /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  };


  checkMobile();
}, []);


// Simplified mobile handler
const onMoveMobile = (e) => {
  if (!dragging.current) return;

  const pt = getPoint(e);
  const dx = pt.clientX - origin.current.x;
  const dy = pt.clientY - origin.current.y;

  // Direct assignment for immediate response
  current.current.x = dx;
  current.current.y = dy;

  if (logoRef.current) {
    logoRef.current.style.transform =
      `translate(-50%, -50%) translate3d(${dx}px, ${dy}px, 0)`;
  }

  // Batch energy updates
  if (Date.now() % 4 === 0 && energyRef.current < maxEnergy) {
    energyRef.current += 0.5;
    setEnergy(energyRef.current);
  }
};
/*
  // RAF loop: ease current -> target (spring) + particle life + waves + bounce
  useEffect(() => {
    let raf;



    const tick = (time) => {
      // springy interpolation for logo
      const k = 0.18; // spring factor (smoother motion)
      current.current.x += (target.current.x - current.current.x) * k;
      current.current.y += (target.current.y - current.current.y) * k;

      if (logoRef.current) {
        // keep the element's natural center, then add our offset
        logoRef.current.style.transform =
          `translate(-50%, -50%) translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }

      // Wave parallax effect based on drag speed
      const waveSpeed = Math.min(1, lastDragSpeed.current * 2);
      waveOffset.current += waveSpeed * 0.5;

      // Bounce effect - subtle up and down movement
      if (lastDragSpeed.current > 0.1) {
        bounceOffset.current = Math.sin(waveOffset.current * 0.02) * lastDragSpeed.current * 3;
      } else {
        // Gentle floating when not dragging
        bounceOffset.current = Math.sin(time * 0.001) * 1;
      }

      // Update wave container transform
      const waveContainer = document.querySelector('.wave-liquid');
      if (waveContainer) {
        waveContainer.style.transform = `translateY(${bounceOffset.current}px)`;
      }

      // Gradually reduce drag speed for calmer waves when not dragging
      lastDragSpeed.current *= 0.95;

      // particle update
      const next = [];
      for (const p of particlesRef.current) {
        const life = p.life - 16;
        if (life <= 0) continue;
        const f = life / p.maxLife;
        next.push({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life,
          op: Math.max(0, f),
          rot: p.rot + p.vr,
          vy: p.vy * 0.98 - 0.05, // float up a bit
        });
      }
      if (next.length !== particlesRef.current.length) setParticles(next);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);*/



// RAF loop: ease current -> target (spring) + particle life + waves + bounce
useEffect(() => {
  let raf;
  let lastTime = 0;

  const tick = (time) => {
    // Throttle updates on mobile
    const delta = time - lastTime;
    if (delta < 16) { // ~60fps cap
      raf = requestAnimationFrame(tick);
      return;
    }
    lastTime = time;

    // SIMPLIFIED SPRING PHYSICS - Mobile optimized
    const dx = target.current.x - current.current.x;
    const dy = target.current.y - current.current.y;

    // Direct interpolation - much lighter than spring physics
    current.current.x += dx * 0.15;
    current.current.y += dy * 0.15;

    if (logoRef.current) {
      logoRef.current.style.transform =
        `translate(-50%, -50%) translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
    }

    // SIMPLIFIED WAVES - Only update when actively dragging
    if (lastDragSpeed.current > 0.1) {
      const waveContainer = document.querySelector('.wave-liquid');
      if (waveContainer) {
        waveContainer.style.transform = `translateY(${Math.sin(time * 0.002) * 2}px)`;
      }
    }

    // Gradually reduce drag speed
    lastDragSpeed.current *= 0.92;

    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, []);



  // pointer handlers
  useEffect(() => {

     if (!charged && energyRef.current == maxEnergy) {
       setCharged(true);
       setDraggable(false);
       // stop dragging target (spring will bring it to center)
       target.current = { x: 0, y: 0 };
     }
    const field = fieldRef.current;
    const el    = logoRef.current;
    if (!field || !el) return;

    const getPoint = (e) => ("touches" in e ? e.touches[0] : e);

  const onDown = (e) => {
    const pt = getPoint(e);
    dragging.current = true;
    el.classList.add("deh-logo--dragging");

    // Get the button's center position in viewport coordinates
    const buttonRect = el.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    // Set origin to the button's center, not the click point
    origin.current = { x: buttonCenterX, y: buttonCenterY };
    lastMove.current = { x: pt.clientX, y: pt.clientY, t: performance.now() };
    e.preventDefault();
  };

const onMove = (e) => {
  if(energyRef.current >= maxEnergy || charged) return;
  if (!draggable || !dragging.current) {
    handleLeave();
    return;
  }

  handleEnter();
  const pt = getPoint(e);

  // SIMPLIFIED MOVEMENT CALCULATION
  const dx = pt.clientX - origin.current.x;
  const dy = pt.clientY - origin.current.y;

  // Fast distance check
  const m = Math.sqrt(dx * dx + dy * dy);
  const R = 150; // Fixed radius for mobile

  // SIMPLIFIED CLAMPING
  if (m > R) {
    const scale = R / m;
    target.current = {
      x: dx * scale,
      y: dy * scale
    };
  } else {
    target.current = { x: dx, y: dy };
  }

  // SIMPLIFIED SPEED CALCULATION
  const now = performance.now();
  const dt = Math.max(1, now - lastMove.current.t);
  const speed = Math.min(2, Math.abs(dx + dy) / dt * 0.5);

  lastMove.current = { x: pt.clientX, y: pt.clientY, t: now };
  lastDragSpeed.current = speed;

  // THROTTLED ENERGY GENERATION
  if (speed > 0.1 && now % 2 === 0) { // Only every other frame
    if (energyRef.current < maxEnergy) {
      const next = Math.min(maxEnergy, energyRef.current + speed * 0.3);
      energyRef.current = next;
      setEnergy(next);
    }
  }
};
/*

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      el.classList.remove("deh-logo--dragging");
      // spring back to center
      target.current = { x: 0, y: 0 };
    };
*/
const onUp = () => {
  if (!dragging.current) return;
  dragging.current = false;
  el.classList.remove("deh-logo--dragging");

  // Clear any existing delay
  if (returnDelay.current) {
    clearTimeout(returnDelay.current);
  }

  // Calculate release velocity for momentum
  const now = performance.now();
  const dt = Math.max(16, now - lastMove.current.t);

  // Get the drag direction but limit the maximum speed
  const speedX = (current.current.x - lastMove.current.x) / dt;
  const speedY = (current.current.y - lastMove.current.y) / dt;

  // Clamp the maximum speed to prevent huge jumps
  const maxSpeed = 5;
  const clampedSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, speedX));
  const clampedSpeedY = Math.max(-maxSpeed, Math.min(maxSpeed, speedY));

  // Set initial velocity
  velocity.current = {
    x: clampedSpeedX * 0.8,
    y: clampedSpeedY * 0.8
  };

  // Small delay before returning to center (300ms)
  returnDelay.current = setTimeout(() => {
    target.current = { x: 0, y: 0 };
    returnDelay.current = null;
  }, 300);
};


    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    el.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("touchstart", onDown);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [maxEnergy]);

  function spawnEmojiParticles(speed) {
  }

  const pct = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

const energyPct = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

// Update background gradient based on energy
useEffect(() => {

  if (energyPct > 0) {
    document.querySelector('.deh-field').classList.add('filled');
  }

  if (energyRef.current >= maxEnergy && !charged) {
    // Stop draggable behavior once the energy is maxed
    setCharged(true);
    setDraggable(false);
    target.current = { x: 0, y: 0 }; // Spring back to center when charged


    lastDragSpeed.current = 0;
    setTimeout(() => {
      if (fieldRef.current) {
        fieldRef.current.classList.add('deh-field--charged');
      }
    }, 200);

  }
}, [energy, maxEnergy,charged]);


  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeHeart() {

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return;
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
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", 16);
    svg.setAttribute("height", 16);
    svg.setAttribute("class", "energy-particle");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z");
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
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return;
    for (let i = 0; i < n; i++) makeHeart();
  }

  function start() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || rate <= 0) return;

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

        <section
          className={`deh-hero deh-hero--full ${size === "compact" ? "deh-hero--compact" : size === "large" ? "deh-hero--large" : ""}`}
          style={{
            ...(fieldMax ? { "--field-max": fieldMax } : null),
            ...(logoSize ? { "--logo": logoSize } : null),
          }}
        >

      <div className="deh-inner">
        {/* LEFT: headline + your CTA slot */}
        <div className="deh-left">
          <div className="deh-eyebrow"><Trans i18nKey="new-changes.eyebrow" /></div>
          <h1 className="deh-title">
            <Trans i18nKey="new-changes.mainNocolor" />{" "}
            <span className="deh-grad"> <Trans i18nKey="new-changes.mainColor" /></span>
          </h1>
          <p className="deh-sub">
            <Trans i18nKey="new-changes.mainUnder" />
          </p>

          {/* YOUR CTA / MODE SLOT */}
          <div className="deh-slot">
            {leftSlot}
          </div>
        </div>

        {/* RIGHT: field + draggable + battery slot */}
        <div className="deh-right">
            <div className={`deh-drag-hint ${charged ? 'deh-drag-hint--hidden' : ''}`}>
              <svg viewBox="0 0 550 800" style={{ width: '150px', height: 'auto' }}>
                <defs>
                  <style>
                    {`@import url('https://fonts.googleapis.com/css2?family=Dokdo&display=swap');`}
                  </style>
                </defs>
                <text
                  style={{
                    fill: 'rgba(134, 134, 135, 0.7)',
                    fontFamily: 'Dokdo',
                    fontSize: '80px',
                    fontWeight: '700',
                    whiteSpace: 'pre'
                  }}
                  transform="matrix(1, 0, 0, 1, 87.329048, 20.042717)"
                >
                  <tspan x="241.944" y="176.09">DRAG </tspan>
                  <tspan x="241.944" dy="1em">IT</tspan>
                </text>
                <path
                  style={{
                    stroke: 'rgba(134, 134, 135, 0.7)',
                    strokeMiterlimit: 5.03,
                    strokeWidth: '11px',
                    paintOrder: 'fill',
                    fill: 'none',
                    strokeLinecap: 'round'
                  }}
                  d="M 307.799 201.859 C 307.799 201.859 207.585 154.615 227.628 214.743 C 247.671 274.871 320.683 395.128 264.85 369.359 C 209.017 343.59 186.111 329.273 164.636 329.273"
                />
                <path
                  d="M 166.49 345.214 Q 164.963 347.67 163.531 345.214 L 145.641 314.539 Q 144.209 312.083 147.168 312.083 L 184.131 312.083 Q 187.09 312.083 185.563 314.539 Z"
                  style={{
                    fill: 'rgba(134, 134, 135, 0.7)',
                    stroke: 'rgba(134, 134, 135, 0.7)'
                  }}
                  transform="matrix(-1, 0, 0, -1, 0, 0)"
                />
                <path
                  d="M 159.33 342.354 Q 157.803 344.81 156.371 342.354 L 138.481 311.679 Q 137.049 309.223 140.008 309.223 L 176.971 309.223 Q 179.93 309.223 178.403 311.679 Z"
                  style={{
                    fill: 'rgba(134, 134, 135, 0.7)',
                    stroke: 'rgba(134, 134, 135, 0.7)'
                  }}
                />
              </svg>
            </div>



            <div
              className="deh-field"
              ref={fieldRef}
            >
              {/* Wave liquid effect */}
              <div
                className="wave-liquid"
                style={{
                  height: `${pct}%`,
                }}
              >
                {!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                  <div>
{/*                    <div className="wave-layer wave-1"></div>
                    <div className="wave-layer wave-2"></div>
                    <div className="wave-layer wave-3"></div>*/}
                    {particles.map(p => (
                      <div key={p.id} className="deh-emoji">...</div>
                    ))}
                  </div>
                )}
              </div>


{/*{!isMobile && (
                  <div>
            {*//* particles *//*}
            {particles.map(p => (
              <div
                key={p.id}
                className="deh-emoji"
                style={{
                  transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`,
                  opacity: p.op,
                }}
              >
                {p.emoji}
              </div>
            ))}
</div>)}*/}
            {/* draggable logo */}

            <button
              ref={logoRef}
              className={`deh-logo ${charged ? 'deh-logo--charged' : ''}`}
              aria-label="Drag to generate energy"
              type="button"
              onFocus={handleEnter}
              onBlur={handleLeave}
            >
                <span className="heart-container" ref={hostRef}>



              <svg width="116" height="116" viewBox="0 0 116 116" aria-hidden>
                <defs>
                  <radialGradient id="halo" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="rgba(255,255,255,.9)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                  <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--logoTop)" />
                    <stop offset="100%" stopColor="var(--logoBottom)" />
                  </linearGradient>
                </defs>
                <circle cx="58" cy="58" r="54" fill="url(#lg)" />
                <circle cx="58" cy="58" r="54" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="3"/>
                <path d="M61 20 L41 58 H58 L49 90 L78 46 H58 L67 20 Z" fill="#fff" opacity=".95" />
              </svg>
                </span>
            </button>


            <div className={`deh-cta ${charged ? 'deh-cta--visible' : ''}`}>
                  <RadialRevealButton
                    onClick={() => dispatch(hideNavButton())}
                    disabled={questionnaireReducer.calculateAble}
                    revealColor={document.documentElement.getAttribute("data-theme") === "kid" ? "#f5f7f6" : "#0b132b"}
                    duration={650}
                    exitFadeMs={450}
                    onComplete={() => history.push("/calculator-kids")}
                    label={
                      <CalculatePillButton
                      variant="circular"
                        disabled={questionnaireReducer.calculateAble}
                        title="Calculate my energy score energy score"
                      />
                    }
                    style={{ background: "transparent", padding: 0, border: "none" }}
                  />
                </div>



          </div>


          {/* Battery slot from parent (your VerticalEnergyBatteryCounter)
          <div className="deh-slot deh-slot--right" >
            {rightBottomSlot}
            <div className="deh-battery-note">{Math.round(energy)} / {maxEnergy}</div>
          </div>*/}

        </div>
      </div>

    </section >
  );
}