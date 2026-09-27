// src/components/RiskScoreRing.js
// Circular risk score visualization

import React from 'react';

export default function RiskScoreRing({ score, level, size = 80 }) {
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - score / 100);

  const colors = {
    LOW: 'var(--color-safe)',
    MEDIUM: 'var(--color-warning)',
    HIGH: 'var(--color-danger)',
  };

  const color = colors[level] || 'var(--color-text-muted)';
  const center = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.14, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {level}
        </span>
      </div>
    </div>
  );
}
