'use client';

import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDateChange?: (range: string) => void;
  accounts?: any[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
}

export default function Header({ 
  title, 
  onRefresh, 
  isRefreshing, 
  onDateChange,
  accounts = [],
  selectedAccountId = 'all',
  onAccountChange
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <div className={styles.titleContent}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>Phân tích hiệu suất thời gian thực</p>
        </div>
        <div className={styles.liveIndicator}>
          <div className={styles.pulse}></div> Live
        </div>
      </div>
      
      <div className={styles.actions}>
        {accounts.length > 0 && (
          <div className={styles.selectWrapper}>
            <span className={styles.inputLabel}>Tài Khoản</span>
            <select 
              className={styles.accountSelect} 
              value={selectedAccountId}
              onChange={(e) => onAccountChange?.(e.target.value)}
            >
              <option value="all" style={{ background: '#18181b', color: '#fff' }}>🌐 Tất cả tài khoản</option>
              {accounts.map((acc: any) => (
                <option key={acc.id} value={acc.id} style={{ background: '#18181b', color: '#fff' }}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.datePickerGroup}>
          <div className={styles.inputWrapper}>
            <span className={styles.inputLabel}>Từ</span>
            <input 
              type="date" 
              className={styles.dateInput} 
              defaultValue={new Date().toISOString().split('T')[0]}
              onChange={(e) => onDateChange?.(e.target.value + '_start')}
            />
          </div>
          <div className={styles.inputWrapper}>
            <span className={styles.inputLabel}>Đến</span>
            <input 
              type="date" 
              className={styles.dateInput} 
              defaultValue={new Date().toISOString().split('T')[0]}
              onChange={(e) => onDateChange?.(e.target.value + '_end')}
            />
          </div>
        </div>
        
        <div className={styles.divider}></div>
        
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.67-5.67" />
          </svg>
          {isRefreshing ? 'Đang đồng bộ...' : 'Làm Mới'}
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}
