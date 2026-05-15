'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { syncAllAccounts } from '@/app/actions/facebook';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
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
    <MainLayout title="Cấu Hình Hệ Thống">
      <div style={{ maxWidth: '800px' }}>
        <section style={{ 
          background: 'var(--bg-panel)', 
          padding: '32px', 
          borderRadius: '16px', 
          border: '1px solid var(--border)' 
        }}>
          <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Trạng Thái Kết Nối Đa Tài Khoản</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            Hệ thống sẽ quét và đồng bộ dữ liệu từ tất cả Ad Accounts của anh.
          </p>
          
          <button 
            onClick={handleTestConnection}
            disabled={loading}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Đang đồng bộ...' : 'Kích Hoạt Đồng Bộ Toàn Bộ'}
          </button>

          {error && (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              background: 'var(--danger-bg)', 
              color: 'var(--danger)', 
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {result && result.success && (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              background: 'var(--success-bg)', 
              color: 'var(--success)', 
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              ✅ Thành công! Đã tìm thấy {result.count} tài khoản và đồng bộ {result.synced} tài khoản đang hoạt động.
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
