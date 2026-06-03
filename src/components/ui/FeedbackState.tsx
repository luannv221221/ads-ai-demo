import type { ReactNode } from 'react';
import styles from './ui.module.css';

type FeedbackTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

interface FeedbackStateProps {
  tone?: FeedbackTone;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function FeedbackState({ tone = 'neutral', title, description, action }: FeedbackStateProps) {
  return (
    <div className={`${styles.feedbackState} ${styles[tone]}`}>
      <div>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className={styles.feedbackAction}>{action}</div> : null}
    </div>
  );
}
