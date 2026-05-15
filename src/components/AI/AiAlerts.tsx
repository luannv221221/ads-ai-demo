'use client';

import React from 'react';

const alerts = [
  {
    id: 1,
    type: 'danger',
    title: 'Cảnh báo ROAS thấp',
    message: 'Chiến dịch "MSG_Summer_Sale" đang có ROAS dưới 1.5 trong 24h qua.',
    time: '5 phút trước'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Tần suất hiển thị cao',
    message: 'Tài khoản Mankai 03 có tần suất lặp > 3.2. Cần thay Creative mới.',
    time: '2 giờ trước'
  },
  {
    id: 3,
    type: 'success',
    title: 'Chạm mốc mục tiêu',
    message: 'Chiến dịch Website đã đạt 50 đơn hàng đầu tiên với CPA lý tưởng.',
    time: 'Hôm qua'
  }
];

export default function AiAlerts() {
  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '18px' }}>🤖</span>
        <h3 style={{ fontSize: '14px', fontWeight: '600' }}>AI Insights</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map(alert => (
          <div key={alert.id} style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            background: alert.type === 'danger' ? 'var(--danger-bg)' : alert.type === 'warning' ? 'var(--warning-bg)' : 'var(--success-bg)',
            border: `1px solid ${alert.type === 'danger' ? 'var(--danger)' : alert.type === 'warning' ? 'var(--warning)' : 'var(--success)'}20`,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: alert.type === 'danger' ? 'var(--danger)' : alert.type === 'warning' ? 'var(--warning)' : 'var(--success)' 
            }}>
              {alert.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {alert.message}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {alert.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
