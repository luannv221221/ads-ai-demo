'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { syncAllAccounts } from '@/app/actions/facebook';
import styles from './settings.module.css';

interface SyncResult {
  success: boolean;
  count?: number;
  synced?: number;
  error?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);
    const res = await syncAllAccounts();
    
    if (res.success) {
      setResult(res);
    } else {
      setError(res.error || 'Lỗi kết nối');
    }
    setLoading(false);
  };

  return (
    <MainLayout 
      title="Cài đặt" 
      showDateRange={false}
      showAccountSelect={false}
    >
      <div className={styles.container}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Trạng thái kết nối</h2>
          
          <div className={styles.statusGrid}>
            <div className={styles.statusCard}>
              <div className={styles.statusLabel}>Meta Marketing API</div>
              <div className={styles.statusValue}>
                <StatusBadge tone={result?.success ? 'success' : 'neutral'}>
                  {result?.success ? 'Đã kết nối' : 'Chưa đồng bộ'}
                </StatusBadge>
              </div>
            </div>
            <div className={styles.statusCard}>
              <div className={styles.statusLabel}>Tài khoản tìm thấy</div>
              <div className={styles.statusValue}>{result?.count ?? '-'}</div>
            </div>
            <div className={styles.statusCard}>
              <div className={styles.statusLabel}>Đã đồng bộ</div>
              <div className={styles.statusValue}>{result?.synced ?? '-'}</div>
            </div>
          </div>

          <p className={styles.sectionDesc}>
            Hệ thống sẽ quét và đồng bộ dữ liệu từ tất cả Ad Accounts của bạn.
          </p>
          
          <button 
            className={styles.syncButton}
            onClick={handleTestConnection}
            disabled={loading}
            type="button"
            aria-label="Đồng bộ toàn bộ tài khoản"
          >
            {loading ? 'Đang đồng bộ...' : 'Kích hoạt đồng bộ toàn bộ'}
          </button>

          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}

          {result && result.success && (
            <div className={styles.successBox}>
              Thành công! Đã tìm thấy {result.count} tài khoản và đồng bộ {result.synced} tài khoản đang hoạt động.
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Thông tin API</h2>
          <FeedbackState 
            tone="info" 
            title="Lưu ý về quyền API" 
            description="Nếu gặp lỗi code 10 / subcode 2332002, ứng dụng Meta của bạn chưa được cấp quyền Ads Library API. Token hợp lệ nhưng app chưa có quyền gọi /ads_archive."
          />
        </section>
      </div>
    </MainLayout>
  );
}
