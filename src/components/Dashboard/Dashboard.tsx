'use client';

import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { getDashboardStats } from '@/app/actions/dashboard';

const KpiCard = ({ title, value, trend, trendType, icon }: any) => (
  <div className={`${styles.kpiCard} glass animate-fade-in`}>
    <div className={styles.kpiHeader}>
      <span className="text-xs">{title}</span>
      <div className={styles.kpiIcon}>{icon}</div>
    </div>
    <div className={styles.kpiValue}>{value}</div>
    <div className={`${styles.trend} ${trendType === 'up' ? styles.trendUp : trendType === 'down' ? styles.trendDown : ''}`}>
      {trendType === 'up' ? '↑' : trendType === 'down' ? '↓' : '•'} {trend}
    </div>
  </div>
);

const FunnelStep = ({ label, value, subValue, percentage, color }: any) => (
  <div className={styles.funnelStep} style={{ '--step-color': color } as any}>
    <div className={styles.funnelContent}>
      <div className={styles.funnelLabel}>{label}</div>
      <div className={styles.funnelMetrics}>
        <span className={styles.funnelValue}>{value}</span>
        <span className={styles.funnelSub}>{subValue}</span>
      </div>
    </div>
    <div className={styles.funnelBar}>
      <div className={styles.funnelProgress} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

interface DashboardProps {
  startDate?: string;
  endDate?: string;
}

export default function Dashboard({ 
  startDate = new Date().toISOString().split('T')[0], 
  endDate = new Date().toISOString().split('T')[0] 
}: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await getDashboardStats('custom', startDate, endDate);
      if (result.success) {
        setStats(result.data);
      }
      setLoading(false);
    }
    loadData();
  }, [startDate, endDate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getTrendText = (val: number | null, suffix: string = 'so với kỳ trước') => {
    if (loading) return '...';
    if (val === null) return 'Chưa có dữ liệu đối chứng';
    if (val === 0) return 'Ổn định';
    return `${Math.abs(val)}% ${val > 0 ? (suffix === 'so với kỳ trước' ? 'so với kỳ trước' : 'tăng trưởng') : 'sụt giảm'}`;
  };

  const getTrendType = (val: number | null) => {
    if (val === null || val === 0) return 'neutral';
    return val > 0 ? 'up' : 'down';
  };

  return (
    <div className={styles.container}>
      {/* SECTION 1: GLOBAL STATS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>1. Toàn Cảnh Chiến Trường (Global)</h2>
          <span className={styles.liveIndicator}>Live</span>
        </div>
        <div className={styles.kpiGrid}>
          <KpiCard 
            title="TỔNG CHI TIÊU" 
            value={loading ? '...' : formatCurrency(stats?.spend || 0)} 
            trend={getTrendText(stats?.trends?.spend)} 
            trendType={getTrendType(stats?.trends?.spend)}
            icon="💰"
          />
          <KpiCard 
            title="LƯỢT HIỂN THỊ" 
            value={loading ? '...' : (stats?.impressions || 0).toLocaleString()} 
            trend={getTrendText(stats?.trends?.impressions, 'tăng trưởng')} 
            trendType={getTrendType(stats?.trends?.impressions)}
            icon="👁️"
          />
          <KpiCard 
            title="TỶ LỆ CTR" 
            value={loading ? '...' : `${stats?.ctr || 0}%`} 
            trend="Độ phủ quảng cáo" 
            trendType="neutral"
            icon="🎯"
          />
          <KpiCard 
            title="LƯỢT NHẤP" 
            value={loading ? '...' : (stats?.clicks || 0).toLocaleString()} 
            trend={getTrendText(stats?.trends?.clicks, 'tăng trưởng')} 
            trendType={getTrendType(stats?.trends?.clicks)}
            icon="🖱️"
          />
          <KpiCard 
            title="ĐƠN HÀNG" 
            value={loading ? '...' : (stats?.purchase || 0).toLocaleString()} 
            trend={getTrendText(stats?.trends?.purchase, 'tăng trưởng')} 
            trendType={getTrendType(stats?.trends?.purchase)}
            icon="📦"
          />
          <KpiCard 
            title="CHỈ SỐ ROAS" 
            value={loading ? '...' : (stats?.roas || 0)} 
            trend={getTrendText(stats?.trends?.roas)} 
            trendType={getTrendType(stats?.trends?.roas)}
            icon="📊"
          />
        </div>
      </section>

      {/* SECTION 2: CREATIVE ANALYSIS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>2. Phân Tích Nội Dung Quảng Cáo (Creative)</h2>
          <span className={styles.liveIndicator}>Video Insights</span>
        </div>
        <div className={styles.kpiGrid}>
          <KpiCard 
            title="HOOK RATE (3 GIÂY ĐẦU)" 
            value={loading ? '...' : `${stats?.hookRate || 0}%`} 
            trend={stats?.hookRate > 30 ? 'Video thu hút tốt ngay từ đầu' : 'Cần tối ưu 3s đầu'} 
            trendType={stats?.hookRate > 30 ? 'up' : 'down'}
            icon="🪝"
          />
          <KpiCard 
            title="HOLD RATE (TỶ LỆ GIỮ CHÂN)" 
            value={loading ? '...' : `${stats?.holdRate || 0}%`} 
            trend={stats?.holdRate > 20 ? 'Tỷ lệ giữ chân tốt' : 'Nội dung chưa đủ lôi cuốn'} 
            trendType={stats?.holdRate > 20 ? 'up' : 'down'}
            icon="⏱️"
          />
          <KpiCard 
            title="OUTBOUND CTR" 
            value={loading ? '...' : `${stats?.outboundCtr || 0}%`} 
            trend={stats?.outboundCtr > 2 ? 'Tỷ lệ click sang trang đích cao' : 'Nội dung chưa đủ kích thích'} 
            trendType={stats?.outboundCtr > 2 ? 'up' : 'down'}
            icon="🚀"
          />
        </div>
      </section>

      {/* SECTION 2: DUAL FUNNEL ANALYSIS */}
      <div className={styles.funnelGrid}>
        {/* MESSENGER FUNNEL */}
        <div className={`${styles.funnelSection} glass`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.funnelTitle}>Phễu Tin Nhắn (MSG)</h3>
            <div className={styles.badge}>Messenger</div>
          </div>
          <div className={styles.funnelWrapper}>
            <FunnelStep label="Tiếp Cận (Reach)" value={loading ? '...' : (stats?.reach || 0).toLocaleString()} subValue="Người" percentage={100} color="#3b82f6" />
            <FunnelStep label="Bắt Đầu Chat" value={loading ? '...' : (stats?.msgStarted || 0).toLocaleString()} subValue="Hội thoại" percentage={stats?.reach > 0 ? (stats.msgStarted / stats.reach) * 100 : 0} color="#8b5cf6" />
            <FunnelStep label="Chi Phí/Tin" value={loading ? '...' : formatCurrency(stats?.msgStarted > 0 ? stats.spend / stats.msgStarted : 0)} subValue="VND" percentage={30} color="#10b981" />
          </div>
          <div className={styles.funnelFooter}>
            <span>Số tin nhắn: <strong>{stats?.msgStarted || 0}</strong></span>
            <span>Tỷ lệ chốt: <strong>{stats?.msgStarted > 0 ? ((stats.purchase / stats.msgStarted) * 100).toFixed(1) : 0}%</strong></span>
          </div>
        </div>

        {/* WEBSITE FUNNEL */}
        <div className={`${styles.funnelSection} glass`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.funnelTitle}>Phễu Website (WEB)</h3>
            <div className={styles.badge}>Conversion</div>
          </div>
          <div className={styles.funnelWrapper}>
            <FunnelStep label="Lượt Nhấp" value={loading ? '...' : (stats?.clicks || 0).toLocaleString()} subValue="Sessions" percentage={100} color="#3b82f6" />
            <FunnelStep label="Thêm Giỏ Hàng" value={loading ? '...' : (stats?.addToCart || 0).toLocaleString()} subValue="Add-to-cart" percentage={stats?.clicks > 0 ? (stats.addToCart / stats.clicks) * 100 : 0} color="#ec4899" />
            <FunnelStep label="Bắt Đầu Thanh Toán" value={loading ? '...' : (stats?.initiateCheckout || 0).toLocaleString()} subValue="Checkout" percentage={stats?.addToCart > 0 ? (stats.initiateCheckout / stats.addToCart) * 100 : 0} color="#8b5cf6" />
            <FunnelStep label="Mua Hàng" value={loading ? '...' : (stats?.purchase || 0).toLocaleString()} subValue="Purchase" percentage={stats?.initiateCheckout > 0 ? (stats.purchase / stats.initiateCheckout) * 100 : 0} color="#10b981" />
          </div>
          <div className={styles.funnelFooter}>
            <span>CPA: <strong>{formatCurrency(stats?.purchase > 0 ? stats.spend / stats.purchase : 0)}</strong></span>
            <span>ROAS: <strong>{stats?.roas || 0}x</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
