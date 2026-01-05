// src/js/container/ModePicker.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trans } from "react-i18next";
/**
 * visible: boolean – controls mount/unmount with animation (FM v6)
 * onPick: (isKid:boolean) => void
 */
export default function ModePicker({ onPick, visible = true }) {
  return (
    <AnimatePresence initial={false} exitBeforeEnter>
      {visible && (
        <motion.div
          key="mode-picker"
          className="mode-picker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.55 } }}
          layout
        >
          <ModeCard
            title="ForKids"
            sub="ForKidsText"
            emoji="🎈"
            theme="kid"
            onClick={() => onPick(true)}
          />
          <ModeCard
            title="ForAdults"
            sub="ForAdultsText"
            emoji="🧠"
            theme="adult"
            onClick={() => onPick(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModeCard({ title, sub, emoji, onClick, theme }) {
  return (
    <motion.button
      onClick={onClick}
      className={`mode-card mode-${theme}`}
      style={{ transformPerspective: 800 }}          // subtle 3D tilt support
      whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="mode-blob" />
      <div className="sparkles" aria-hidden />
      <div className="mode-content">
        <div className="mode-emoji">{emoji}</div>
        <div className="mode-title"><Trans i18nKey={`new-changes.${title}`} /> </div>
        <div className="mode-sub"><Trans i18nKey={`new-changes.${sub}`} /></div>
      </div>
    </motion.button>
  );
}
