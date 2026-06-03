'use client';

import React from 'react';
import type { DateRange } from '@/lib/dateRange';
import styles from './Header.module.css';

interface HeaderAccount {
  id: string;
  name?: string;
  account_id?: string;
}

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  showDateRange?: boolean;
  showAccountSelect?: boolean;
  dataStatus?: 'live' | 'synced' | 'demo' | 'error' | 'idle';
  dataStatusLabel?: string;
  accounts?: HeaderAccount[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
}

export default function Header({ 
  title, 
  onRefresh, 
  isRefreshing, 
  dateRange,
  onDateRangeChange,
  showDateRange = Boolean(dateRange && onDateRangeChange),
  showAccountSelect = true,
  dataStatus = 'live',
  dataStatusLabel,
  accounts = [],
  selectedAccountId = 'all',
  onAccountChange
}: HeaderProps) {
  const statusLabel = dataStatusLabel || {
    live: 'Đang hoạt động',
    synced: 'Đã đồng bộ',
    demo: 'Dữ liệu demo',
    error: 'Có lỗi dữ liệu',
    idle: 'Chưa đồng bộ',
  }[dataStatus];

  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <div className={styles.titleContent}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>Phân tích hiệu suất thời gian thực</p>
        </div>
        <div className={`${styles.liveIndicator} ${styles[dataStatus]}`}>
          <div className={styles.pulse}></div> {statusLabel}
        </div>
      </div>
      
      <div className={styles.actions}>
        {showAccountSelect && accounts.length > 0 && (
          <div className={styles.selectWrapper}>
            <span className={styles.inputLabel}>Tài Khoản</span>
            <select 
              className={styles.accountSelect} 
              value={selectedAccountId}
              onChange={(e) => onAccountChange?.(e.target.value)}
            >
              <option value="all">Tất cả tài khoản</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name || account.account_id || account.id}
                </option>
              ))}
            </select>
          </div>
        )}

        {showDateRange && dateRange && onDateRangeChange && (
          <div className={styles.datePickerGroup}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputLabel}>Từ</span>
              <input
                type="date"
                className={styles.dateInput}
                aria-label="Ngày bắt đầu"
                value={dateRange.start}
                onChange={(event) => onDateRangeChange({ ...dateRange, start: event.target.value })}
              />
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputLabel}>Đến</span>
              <input
                type="date"
                className={styles.dateInput}
                aria-label="Ngày kết thúc"
                value={dateRange.end}
                onChange={(event) => onDateRangeChange({ ...dateRange, end: event.target.value })}
              />
            </div>
          </div>
        )}
        
        {onRefresh && <div className={styles.divider}></div>}
        
        {onRefresh && (
          <button
            type="button"
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
              className={isRefreshing ? styles.spinningIcon : ''}
              aria-hidden="true"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-10.44l5.67-5.67" />
            </svg>
            {isRefreshing ? 'Đang đồng bộ...' : 'Làm mới'}
          </button>
        )}
      </div>
    </header>
  );
}
