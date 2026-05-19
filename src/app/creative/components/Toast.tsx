import type { ToastMessage } from '../types';
import styles from '../creative.module.css';

interface ToastProps {
  toast: ToastMessage | null;
}

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div className={`${styles.toast} ${styles[`toast${toast.type}`]}`}>
      {toast.message}
    </div>
  );
}
