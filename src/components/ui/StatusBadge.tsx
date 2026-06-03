import type { ReactNode } from 'react';
import styles from './ui.module.css';

type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export function StatusBadge({ tone = 'neutral', children }: StatusBadgeProps) {
  return <span className={`${styles.statusBadge} ${styles[tone]}`}>{children}</span>;
}
