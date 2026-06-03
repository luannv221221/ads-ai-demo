'use client';

import React from 'react';
import type { DateRange } from '@/lib/dateRange';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { FeedbackState } from '../ui/FeedbackState';
import styles from './MainLayout.module.css';

type MainLayoutMode = 'standard' | 'fullHeight';

interface LayoutAccount {
  id: string;
  name?: string;
  account_id?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  contentMode?: MainLayoutMode;
  showRightSidebar?: boolean;
  rightSidebarContent?: React.ReactNode;
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

export default function MainLayout({ 
  children, 
  title = 'Dashboard', 
  contentMode = 'standard',
  showRightSidebar = true,
  rightSidebarContent,
  onRefresh,
  isRefreshing,
  dateRange,
  onDateRangeChange,
  showDateRange,
  showAccountSelect,
  dataStatus,
  dataStatusLabel,
  accounts = [],
  selectedAccountId = 'all',
  onAccountChange
}: MainLayoutProps) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <div className={styles.mainWrapper}>
        <Header 
          title={title} 
          onRefresh={onRefresh} 
          isRefreshing={isRefreshing}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          showDateRange={showDateRange}
          showAccountSelect={showAccountSelect}
          dataStatus={dataStatus}
          dataStatusLabel={dataStatusLabel}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={onAccountChange}
        />
        <main className={`${styles.content} ${contentMode === 'fullHeight' ? styles.contentFullHeight : ''}`}>
          {children}
        </main>
      </div>

      {showRightSidebar && (
        <aside className={styles.rightSidebar}>
          {rightSidebarContent || (
            <FeedbackState tone="neutral" title="Chưa có thông báo mới" />
          )}
        </aside>
      )}
    </div>
  );
}
