'use client';

import React from 'react';
import type { DateRange } from '@/lib/dateRange';
import { StatusBadge } from '../ui/StatusBadge';
import styles from './Header.module.css';

interface LayoutAccount {
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
  accounts?: LayoutAccount[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
}

const DATA_STATUS_LABELS: Record<string, string> = {
  live: 'Dữ liệu Meta (live)',
  synced: 'Dữ liệu Meta',
  demo: 'Dữ liệu demo',
  error: 'Lỗi kết nối',
  idle: 'Chưa đồng bộ',
};

const DATA_STATUS_TONES: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  live: 'success',
  synced: 'success',
  demo: 'warning',
  error: 'danger',
  idle: 'neutral',
};

export default function Header({ 
  title, 
  onRefresh, 
  isRefreshing, 
  dateRange,
  onDateRangeChange,
  showDateRange = true,
  showAccountSelect = true,
  dataStatus,
  dataStatusLabel,
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
        {dataStatus && (
          <StatusBadge tone={DATA_STATUS_TONES[dataStatus] || 'neutral'}>
            {dataStatusLabel || DATA_STATUS_LABELS[dataStatus] || dataStatus}
          </StatusBadge>
        )}
      </div>
      
      <div className={styles.actions}>
        {showAccountSelect && accounts.length > 0 && (
          <div className={styles.selectWrapper}>
            <span className={styles.inputLabel}>Tài Khoản</span>
            <select 
              className={styles.accountSelect} 
              value={selectedAccountId}
              onChange={(e) => onAccountChange?.(e.target.value)}
              aria-label="Chọn tài khoản quảng cáo"
            >
              <option value="all">Tất cả tài khoản</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name || acc.account_id}
                </option>
              ))}
            </select>
          </div>
        )}

        {showDateRange && (
          <div className={styles.datePickerGroup}>
            <div className={styles.inputWrapper}>
              <span className={styles.inputLabel}>Từ</span>
              <input 
                type="date" 
                className={styles.dateInput} 
                value={dateRange?.start || ''}
                onChange={(e) => {
                  if (dateRange && onDateRangeChange) {
                    onDateRangeChange({ start: e.target.value, end: dateRange.end });
                  }
                }}
                aria-label="Ngày bắt đầu"
              />
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputLabel}>Đến</span>
              <input 
                type="date" 
                className={styles.dateInput} 
                value={dateRange?.end || ''}
                onChange={(e) => {
                  if (dateRange && onDateRangeChange) {
                    onDateRangeChange({ start: dateRange.start, end: e.target.value });
                  }
                }}
                aria-label="Ngày kết thúc"
              />
            </div>
          </div>
        )}
        
        {onRefresh && (
          <>
            <div className={styles.divider}></div>
            <button 
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Làm mới dữ liệu"
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
          </>
        )}
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
