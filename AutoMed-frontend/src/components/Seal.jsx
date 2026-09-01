import React, { useEffect, useState } from 'react';

const RISK_COLOR = {
  Low: '#2f6d4f',
  Medium: '#a17512',
  High: '#b5541c',
  Critical: '#a52323'
};

const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

/**
 * Circular scanning / progress visual.
 * - While `scanning` is true: a rotating arc sweeps around the ring (searching state).
 * - Once a `score` is provided: the ring animates from 0 to score, colored by risk level,
 *   with the number counting up in sync.
 */
export default function Seal({ score, level, scanning = false }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [dash, setDash] = useState(CIRC);

  useEffect(() => {
    if (scanning || score == null) return;
    const target = score;
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      setDisplayScore(current);
      setDash(CIRC - (eased * target / 100) * CIRC);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [score, scanning]);

  const color = RISK_COLOR[level] || '#c8912f';

  if (scanning) {
    return (
      <div style={{ width: 128, height: 128, position: 'relative' }}>
        <svg width="128" height="128" viewBox="0 0 128 128" style={{ animation: 'spin 1.1s linear infinite' }}>
          <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="4" />
          <circle
            cx="64" cy="64" r={RADIUS} fill="none" stroke="#c8912f" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${CIRC * 0.22} ${CIRC}`}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>
            Scanning
          </span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: 128, height: 128, position: 'relative' }}>
      <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle
          cx="64" cy="64" r={RADIUS} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dash}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="font-display font-bold" style={{ fontSize: 30, lineHeight: 1, color }}>{displayScore}</span>
        <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2, color }}>
          {level}
        </span>
      </div>
    </div>
  );
}
