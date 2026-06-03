'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/navigation';
import styles from './Sidebar.module.css';

type NavIcon = (typeof NAV_ITEMS)[number]['icon'];

export default function Sidebar() {
  const pathname = usePathname();
  const groups = Array.from(new Set(NAV_ITEMS.map((item) => item.group)));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 className={styles.logoText}>Ads Manager</h2>
      </div>

      <nav className={styles.nav} aria-label="Điều hướng chính">
        {groups.map((group) => (
          <div key={group} className={styles.navGroup}>
            <div className={styles.navGroupLabel}>{group}</div>
            {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
              const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  title={item.label}
                >
                  <NavIcon icon={item.icon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>MB</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Media Buyer</span>
            <span className={styles.userRole}>Team Performance</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavIcon({ icon }: { icon: NavIcon }) {
  if (icon === 'dashboard') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    );
  }

  if (icon === 'campaigns') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  if (icon === 'creative') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    );
  }

  if (icon === 'ai') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12h4l2-9 5 18 3-13 4 4h4" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 1 1-2.98 2.98l-.04-.04A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .6 1.8 1.8 0 0 0-.4 1.2V21a2.1 2.1 0 1 1-4.2 0v-.08A1.8 1.8 0 0 0 8 19.4a1.8 1.8 0 0 0-1.98.36l-.04.04A2.1 2.1 0 1 1 3 16.82l.04-.04A1.8 1.8 0 0 0 3.6 15a1.8 1.8 0 0 0-.6-1 1.8 1.8 0 0 0-1.2-.4H1.7a2.1 2.1 0 1 1 0-4.2h.1A1.8 1.8 0 0 0 3.6 8a1.8 1.8 0 0 0-.36-1.98L3.2 5.98A2.1 2.1 0 1 1 6.18 3l.04.04A1.8 1.8 0 0 0 8 3.6a1.8 1.8 0 0 0 1-.6 1.8 1.8 0 0 0 .4-1.2V1.7a2.1 2.1 0 1 1 4.2 0v.1A1.8 1.8 0 0 0 15 3.6a1.8 1.8 0 0 0 1.98-.36l.04-.04A2.1 2.1 0 1 1 20 6.18l-.04.04A1.8 1.8 0 0 0 19.4 8c.08.38.28.72.6 1 .32.28.74.4 1.2.4h.1a2.1 2.1 0 1 1 0 4.2h-.1a1.8 1.8 0 0 0-1.8 1.4z" />
    </svg>
  );
}
