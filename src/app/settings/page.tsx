'use client';

import { useState } from 'react';
import { syncAllAccounts } from '@/app/actions/facebook';
import MainLayout from '@/components/Layout/MainLayout';
import { FeedbackState } from '@/components/ui/FeedbackState';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
      setResult(null);
      setError(res.error || 'Lỗi kết nối');
    }
    setLoading(false);
  };

  return (
    <MainLayout title="Cấu hình hệ thống" showRightSidebar={false} showAccountSelect={false} showDateRange={false} dataStatus="idle" dataStatusLabel="Cấu hình">
      <div className={styles.container}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Trạng thái kết nối Meta</h2>
              <p>Kiểm tra token ads công ty, token Ad Library và đồng bộ dữ liệu từ các Ad Accounts.</p>
            </div>
            <StatusBadge tone={error ? 'danger' : result ? 'success' : 'neutral'}>
              {error ? 'Có lỗi' : result ? 'Đã đồng bộ' : 'Chưa kiểm tra'}
            </StatusBadge>
          </div>

          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span>Token ads công ty</span>
              <strong>FB_ACCESS_TOKEN</strong>
            </div>
            <div className={styles.statusItem}>
              <span>Token phân tích đối thủ</span>
              <strong>FB_AD_LIBRARY_ACCESS_TOKEN</strong>
            </div>
          </div>

          <button type="button" className={styles.primaryButton} onClick={handleTestConnection} disabled={loading}>
            {loading ? 'Đang đồng bộ...' : 'Đồng bộ tất cả tài khoản'}
          </button>

          {error && (
            <FeedbackState
              tone="danger"
              title="Không thể đồng bộ"
              description={error}
            />
          )}

          {result?.success && (
            <FeedbackState
              tone="success"
              title="Đồng bộ thành công"
              description={`Đã tìm thấy ${result.count || 0} tài khoản và đồng bộ ${result.synced || 0} dòng dữ liệu đang hoạt động.`}
            />
          )}

          <FeedbackState
            tone="info"
            title="Lưu ý về Meta Ad Library"
            description="Nếu API trả lỗi quyền code 10/subcode 2332002, token có thể hợp lệ nhưng ứng dụng Meta chưa được cấp quyền gọi /ads_archive."
          />
        </section>
      </div>
    </MainLayout>
  );
}
