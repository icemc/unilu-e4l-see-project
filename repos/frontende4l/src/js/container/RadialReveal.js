import React, { useRef, useState, useEffect, useCallback } from "react";

/**
 * RadialRevealButton
 * -------------------
 * Drop-in button that performs a fullscreen circular clip-path reveal
 * starting from the click point. After the animation finishes, it optionally
 * calls onComplete (e.g., to navigate or show the next page).
 *
 * Props:
 *  - label: string | ReactNode — button content
 *  - revealContent: ReactNode — what to reveal (fullscreen) during/after animation
 *  - revealColor: string — background color for the reveal layer (defaults to #111)
 *  - duration: number — animation duration ms (default 600)
 *  - onComplete?: () => void — called after the reveal finishes
 *  - startOpen?: boolean — if true, the reveal is already visible (for stacks)
 */
export function RadialRevealButton({
  label = "Reveal",
  revealContent = null,
  revealColor = "#111",
  duration = 600,
  exitFadeMs = 350, // NEW: fade-out of the overlay after navigation
  onComplete,
  startOpen = false,
  ...btnProps
}) {
  // We'll create the overlay as a raw DOM element mounted to document.body so it can
  // survive route changes (i.e., navigate to /calculator, then fade overlay out to reveal it).
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [animating, setAnimating] = useState(false);

  const makeOverlay = () => {
    if (overlayRef.current) return overlayRef.current;
    const el = document.createElement("div");
    el.setAttribute("data-radial-overlay", "");
    Object.assign(el.style, {
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: revealColor,
      display: "grid",
      placeItems: "center",
      color: "#fff",
      overflow: "hidden",
      opacity: "1",
      clipPath: startOpen ? "none" : "circle(0px at 0px 0px)",
    });

    // Inner content holder
    const inner = document.createElement("div");
    Object.assign(inner.style, { pointerEvents: "none" });
    el.appendChild(inner);

    document.body.appendChild(el);
    overlayRef.current = el;
    contentRef.current = inner;
    return el;
  };

  const destroyOverlay = () => {
    const el = overlayRef.current;
    if (!el) return;
    el.remove();
    overlayRef.current = null;
    contentRef.current = null;
  };

  const handleClick = (e) => {
    // Compute click origin in viewport coords
    const x = e.clientX;
    const y = e.clientY;

    const el = makeOverlay();
    el.style.background = revealColor; // ensure theme-consistent per click

    // Fill content if provided
    if (revealContent && contentRef.current) {
      // Render simple content text if it's a string; otherwise, mount a minimal clone via innerHTML
      // For React nodes, the simplest approach is to set text if it's primitive.
      // To keep things lightweight and dependency-free, we only support string content here.
      if (typeof revealContent === "string") {
        contentRef.current.textContent = revealContent;
      } else {
        contentRef.current.textContent = ""; // ignore complex nodes in this raw overlay
      }
    }

    // Compute maximum radius to cover viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dx = Math.max(x, vw - x);
    const dy = Math.max(y, vh - y);
    const maxR = Math.sqrt(dx * dx + dy * dy);

    // Start animation
    setAnimating(true);
    const expand = el.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${maxR}px at ${x}px ${y}px)` },
      ],
      { duration, easing: "cubic-bezier(.22,.61,.36,1)", fill: "forwards" }
    );

    expand.onfinish = async () => {
      setAnimating(false);
      // Navigate (or any user action)
      try { onComplete && (await onComplete()); } catch (_) {}

      // Fade overlay out to reveal the new route underneath
      const fade = el.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: exitFadeMs, easing: "ease", fill: "forwards" }
      );
      fade.onfinish = () => destroyOverlay();
    };
  };

  // Clean up if this component unmounts mid-animation
  useEffect(() => destroyOverlay, []);

  return (
    <button
      {...btnProps}
      onClick={(e) => {
        btnProps.onClick(e);
        if (animating) return;
        handleClick(e);
      }}
      style={{
        border: "none",
        fontSize: 16,
        fontWeight: 600,
        color: "#fff",
        background: "none",
        cursor: animating ? "default" : "pointer",
        opacity: animating ? 0.9 : 1,
      }}
      disabled={btnProps.disabled || animating}
      aria-disabled={btnProps.disabled || animating}
    >
      {label}
    </button>
  );
}
