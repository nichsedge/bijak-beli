"use client";

import { gradeColor } from "@/lib/scoring";
import type { AlignmentResult } from "@/lib/types";
import styles from "./ScoreBadge.module.css";

interface ScoreBadgeProps {
  result: AlignmentResult;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

export default function ScoreBadge({ result, size = "md", showLabel = false, animate = true }: ScoreBadgeProps) {
  const { score, grade } = result;
  const color = gradeColor(grade);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`${styles.badge} ${styles[size]}`}>
      <svg
        viewBox="0 0 100 100"
        className={`${styles.ring} ${animate ? styles.animate : ""}`}
        aria-label={`Score: ${score} (${grade})`}
      >
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth="8"
        />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className={styles.fillArc}
          style={{ "--offset": offset + "px", "--circumference": circumference + "px" } as React.CSSProperties}
        />
        <text
          x="50" y="44"
          textAnchor="middle"
          className={styles.scoreText}
          fill={color}
        >
          {score}
        </text>
        <text
          x="50" y="62"
          textAnchor="middle"
          className={styles.gradeText}
          fill={color}
        >
          {grade}
        </text>
      </svg>

      {showLabel && (
        <span className={styles.label} style={{ color }}>
          {grade}
        </span>
      )}
    </div>
  );
}

// Compact pill variant for cards
export function ScorePill({ result }: { result: AlignmentResult }) {
  const color = gradeColor(result.grade);
  return (
    <div
      className={styles.pill}
      style={{ "--score-color": color } as React.CSSProperties}
      title={`Score: ${result.score}/100`}
    >
      <span className={styles.pillScore}>{result.score}</span>
      <span className={styles.pillGrade}>{result.grade}</span>
    </div>
  );
}
