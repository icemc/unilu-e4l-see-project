// CalculatePillButton.jsx
import React from "react";
import { Trans } from "react-i18next";

export default function CalculatePillButton({
  onClick,
  disabled = false,
  title = "Calculate energy score",
  variant = 'regular',
  // optional custom gradient colors; otherwise it uses CSS variables
  colorA,
  colorB,
}) {
 const className = variant === 'circular' ? 'calc-pill-circ' : 'calc-pill';

  const style = {};
  if (colorA) style["--i"] = colorA;
  if (colorB) style["--j"] = colorB;

  return (
    <div
      className={` btn-pill neon-pulse ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
      style={{
                       border: "none",
                       background: "none",
                     }}
      aria-label={title}
    >    <button
           type="button"
           className={` ${className}`}
           onClick={onClick}
           disabled={disabled}
           style={style}
           aria-label={title}
         >
      <span className="pill-icon" aria-hidden>⚡</span>
      <span className="pill-title"><Trans i18nKey="home.calculate" /></span>
      </button>
    </div>
  );
}
