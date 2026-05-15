'use client';

import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  showRightSidebar?: boolean;
  rightSidebarContent?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onDateChange?: (range: string) => void;
}

export default function MainLayout({ 
  children, 
  title = 'Dashboard', 
  showRightSidebar = true,
  rightSidebarContent,
  onRefresh,
  isRefreshing,
  onDateChange
}: MainLayoutProps) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <div className={styles.mainWrapper}>
        <Header 
          title={title} 
          onRefresh={onRefresh} 
          isRefreshing={isRefreshing} 
          onDateChange={onDateChange}
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>

      {showRightSidebar && (
        <aside className={styles.rightSidebar}>
          {rightSidebarContent || (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
              Chưa có thông báo mới
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
