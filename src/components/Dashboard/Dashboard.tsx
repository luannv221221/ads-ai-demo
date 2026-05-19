'use client';

import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { getDashboardStats, getRealCampaignsData } from '@/app/actions/dashboard';

// Premium high-fidelity mock data representing Facebook Campaigns, Ad Sets, and Ads
const CAMPAIGNS_DATA = [
  {
    id: 'camp1',
    name: 'US_Advantage+_Scaling_V2',
    objective: 'website',
    spend: 1240,
    cpa: 14.20,
    metricType: 'CPA',
    performance: '5.4x ROAS',
    status: 'scale',
    statusLabel: 'Đang Vít (Scale)',
    adSets: [
      {
        id: 'adset1_1',
        name: 'Broad_Audience_18_35',
        spend: 800,
        cpa: 12.50,
        metricType: 'CPA',
        performance: '6.1x ROAS',
        status: 'active',
        statusLabel: 'Active',
        ads: [
          {
            id: 'ad1_1_1',
            name: 'Video_UGC_Review_01',
            spend: 500,
            cpa: 10.20,
            metricType: 'CPA',
            performance: '7.2x ROAS',
            hookRate: 'Hook: 45%',
            status: 'winning',
            statusLabel: 'Winning'
          },
          {
            id: 'ad1_1_2',
            name: 'Image_Product_Detail_02',
            spend: 300,
            cpa: 16.33,
            metricType: 'CPA',
            performance: '4.2x ROAS',
            hookRate: 'Hook: 28%',
            status: 'active',
            statusLabel: 'Active'
          }
        ]
      },
      {
        id: 'adset1_2',
        name: 'Lookalike_Buyers_1%',
        spend: 440,
        cpa: 17.30,
        metricType: 'CPA',
        performance: '4.1x ROAS',
        status: 'active',
        statusLabel: 'Active',
        ads: [
          {
            id: 'ad1_2_1',
            name: 'Video_Feature_Highlight',
            spend: 440,
            cpa: 17.30,
            metricType: 'CPA',
            performance: '4.1x ROAS',
            hookRate: 'Hook: 32%',
            status: 'active',
            statusLabel: 'Active'
          }
        ]
      }
    ]
  },
  {
    id: 'camp2',
    name: 'VN_Retargeting_Sale_TinNhan',
    objective: 'messenger',
    spend: 450,
    cpa: 0.85,
    metricType: 'CPM',
    performance: '22.5% Xin Số',
    status: 'scale',
    statusLabel: 'Đang Vít (Scale)',
    adSets: [
      {
        id: 'adset2_1',
        name: 'CustomAudience_PageEngagers_30d',
        spend: 300,
        cpa: 0.80,
        metricType: 'CPM',
        performance: '25.0% Xin Số',
        status: 'active',
        statusLabel: 'Active',
        ads: [
          {
            id: 'ad2_1_1',
            name: 'Image_Promo_BOGO_01',
            spend: 200,
            cpa: 0.75,
            metricType: 'CPM',
            performance: '28.0% Xin Số',
            status: 'winning',
            statusLabel: 'Winning'
          },
          {
            id: 'ad2_1_2',
            name: 'Video_CustomerFeedback_02',
            spend: 100,
            cpa: 0.90,
            metricType: 'CPM',
            performance: '19.0% Xin Số',
            status: 'active',
            statusLabel: 'Active'
          }
        ]
      },
      {
        id: 'adset2_2',
        name: 'CustomAudience_WebsiteVisitors_14d',
        spend: 150,
        cpa: 0.95,
        metricType: 'CPM',
        performance: '17.5% Xin Số',
        status: 'active',
        statusLabel: 'Active',
        ads: [
          {
            id: 'ad2_2_1',
            name: 'Image_Showcase_Collection',
            spend: 150,
            cpa: 0.95,
            metricType: 'CPM',
            performance: '17.5% Xin Số',
            status: 'active',
            statusLabel: 'Active'
          }
        ]
      }
    ]
  },
  {
    id: 'camp3',
    name: 'VN_Broad_GenZ_Video_New',
    objective: 'messenger',
    spend: 210,
    cpa: 2.10,
    metricType: 'CPM',
    performance: '12% Xin Số',
    status: 'watch',
    statusLabel: 'Đang Theo Dõi',
    adSets: [
      {
        id: 'adset3_1',
        name: 'GenZ_Interests_Creative_Focus',
        spend: 210,
        cpa: 2.10,
        metricType: 'CPM',
        performance: '12.0% Xin Số',
        status: 'active',
        statusLabel: 'Active',
        ads: [
          {
            id: 'ad3_1_1',
            name: 'Video_TikTokStyle_Challenge',
            spend: 210,
            cpa: 2.10,
            metricType: 'CPM',
            performance: '12% Xin Số',
            status: 'active',
            statusLabel: 'Active'
          }
        ]
      }
    ]
  },
  {
    id: 'camp4',
    name: 'CA_Retargeting_DABA_Catalog',
    objective: 'website',
    spend: 890,
    cpa: 38.50,
    metricType: 'CPA',
    performance: '1.2x ROAS',
    status: 'kill',
    statusLabel: 'Sắp Tắt (Kill)',
    adSets: [
      {
        id: 'adset4_1',
        name: 'DABA_ProductCatalog_Dynamic',
        spend: 890,
        cpa: 38.50,
        metricType: 'CPA',
        performance: '1.2x ROAS',
        status: 'paused',
        statusLabel: 'Paused',
        ads: [
          {
            id: 'ad4_1_1',
            name: 'Dynamic_Carousel_Catalog_01',
            spend: 890,
            cpa: 38.50,
            metricType: 'CPA',
            performance: '1.2x ROAS',
            hookRate: 'Hook: 18%',
            status: 'paused',
            statusLabel: 'Paused'
          }
        ]
      }
    ]
  }
];

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
  adAccountId?: string;
}

export default function Dashboard({ 
  startDate = new Date().toISOString().split('T')[0], 
  endDate = new Date().toISOString().split('T')[0],
  adAccountId = 'all'
}: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Campaign table interaction states
  const [expandedCampaigns, setExpandedCampaigns] = useState<string[]>([]);
  const [expandedAdSets, setExpandedAdSets] = useState<string[]>([]);
  const [filterObjective, setFilterObjective] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['objective', 'spend', 'cpa_cpm', 'performance', 'status']);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const statsPromise = getDashboardStats('custom', startDate, endDate, adAccountId);
      const campaignsPromise = getRealCampaignsData(adAccountId, startDate, endDate);
      
      const [statsResult, campaignsResult] = await Promise.all([statsPromise, campaignsPromise]);
      
      if (statsResult.success) {
        setStats(statsResult.data);
      }
      
      if (campaignsResult.success) {
        if (campaignsResult.isMock || !campaignsResult.data || campaignsResult.data.length === 0) {
          setCampaigns(CAMPAIGNS_DATA);
        } else {
          setCampaigns(campaignsResult.data);
        }
      } else {
        setCampaigns(CAMPAIGNS_DATA);
      }
      
      setLoading(false);
    }
    loadData();
  }, [startDate, endDate, adAccountId]);

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

  const toggleCampaign = (id: string) => {
    setExpandedCampaigns(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAdSet = (id: string) => {
    setExpandedAdSets(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter campaigns based on objective and text search
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterObjective !== 'all' && campaign.objective !== filterObjective) {
      return false;
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      
      if (campaign.name.toLowerCase().includes(query)) return true;
      
      const hasMatchingAdSet = campaign.adSets.some((adSet: any) => {
        if (adSet.name.toLowerCase().includes(query)) return true;
        return adSet.ads.some((ad: any) => ad.name.toLowerCase().includes(query));
      });
      
      return hasMatchingAdSet;
    }
    
    return true;
  });

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

      {/* SECTION 3 & 4: DUAL FUNNEL ANALYSIS */}
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

      {/* SECTION 5: DATA GRID DRILLDOWN (Bảng Điều Khiển Chiến Dịch) */}
      <div className={`${styles.tablePanel} glass animate-fade-in`}>
        <div className={styles.tableHeaderPanel}>
          <h3 className={styles.tableTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ stroke: 'var(--text-secondary)' }}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Bảng Điều Khiển Chiến Dịch
          </h3>
          
          <div className={styles.actionsContainer}>
            {/* Search Input */}
            <div className={styles.searchInputWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="Tìm chiến dịch, ad set, ad..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                className={`${styles.btn} ${filterObjective !== 'all' ? styles.btnActive : ''}`}
                onClick={() => {
                  setIsFilterOpen(!isFilterOpen);
                  setIsColumnsOpen(false);
                }}
              >
                Lọc theo mục tiêu 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {isFilterOpen && (
                <div className={styles.dropdownMenu}>
                  <button 
                    className={`${styles.dropdownItem} ${filterObjective === 'all' ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setFilterObjective('all'); setIsFilterOpen(false); }}
                  >
                    Tất cả mục tiêu
                  </button>
                  <button 
                    className={`${styles.dropdownItem} ${filterObjective === 'website' ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setFilterObjective('website'); setIsFilterOpen(false); }}
                  >
                    🌐 Website (LP)
                  </button>
                  <button 
                    className={`${styles.dropdownItem} ${filterObjective === 'messenger' ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setFilterObjective('messenger'); setIsFilterOpen(false); }}
                  >
                    💬 Messenger
                  </button>
                </div>
              )}
            </div>

            {/* Columns Customizer */}
            <div style={{ position: 'relative' }}>
              <button 
                className={styles.btn}
                onClick={() => {
                  setIsColumnsOpen(!isColumnsOpen);
                  setIsFilterOpen(false);
                }}
              >
                Cột hiển thị
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {isColumnsOpen && (
                <div className={styles.dropdownMenu} style={{ minWidth: '160px' }}>
                  <label className={styles.dropdownItem} style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px' }}
                      checked={visibleColumns.includes('objective')}
                      onChange={() => setVisibleColumns(prev => prev.includes('objective') ? prev.filter(c => c !== 'objective') : [...prev, 'objective'])}
                    />
                    Mục tiêu
                  </label>
                  <label className={styles.dropdownItem} style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px' }}
                      checked={visibleColumns.includes('spend')}
                      onChange={() => setVisibleColumns(prev => prev.includes('spend') ? prev.filter(c => c !== 'spend') : [...prev, 'spend'])}
                    />
                    Chi Tiêu
                  </label>
                  <label className={styles.dropdownItem} style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px' }}
                      checked={visibleColumns.includes('cpa_cpm')}
                      onChange={() => setVisibleColumns(prev => prev.includes('cpa_cpm') ? prev.filter(c => c !== 'cpa_cpm') : [...prev, 'cpa_cpm'])}
                    />
                    CPA / CPM
                  </label>
                  <label className={styles.dropdownItem} style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px' }}
                      checked={visibleColumns.includes('performance')}
                      onChange={() => setVisibleColumns(prev => prev.includes('performance') ? prev.filter(c => c !== 'performance') : [...prev, 'performance'])}
                    />
                    Hiệu Quả
                  </label>
                  <label className={styles.dropdownItem} style={{ cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px' }}
                      checked={visibleColumns.includes('status')}
                      onChange={() => setVisibleColumns(prev => prev.includes('status') ? prev.filter(c => c !== 'status') : [...prev, 'status'])}
                    />
                    Trạng Thái
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '50px' }} className={styles.th}></th>
                {visibleColumns.includes('objective') && <th className={styles.th} style={{ width: '120px' }}>Mục tiêu</th>}
                <th className={styles.th}>Tên Chiến Dịch / Ad Set / Ad</th>
                {visibleColumns.includes('spend') && <th className={styles.th} style={{ width: '120px' }}>Chi Tiêu</th>}
                {visibleColumns.includes('cpa_cpm') && <th className={styles.th} style={{ width: '150px' }}>CPA / CPM</th>}
                {visibleColumns.includes('performance') && <th className={styles.th} style={{ width: '180px' }}>Hiệu Quả (ROAS/Lead)</th>}
                {visibleColumns.includes('status') && <th className={styles.th} style={{ width: '150px' }}>Trạng Thái</th>}
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Không tìm thấy chiến dịch nào khớp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const isCampExpanded = expandedCampaigns.includes(campaign.id);
                  const isWeb = campaign.objective === 'website';
                  
                  return (
                    <React.Fragment key={campaign.id}>
                      {/* Campaign (Parent) Row */}
                      <tr 
                        className={styles.parentRow}
                        onClick={() => toggleCampaign(campaign.id)}
                      >
                        <td className={styles.td} onClick={(e) => { e.stopPropagation(); toggleCampaign(campaign.id); }}>
                          <div className={`${styles.drillToggle} ${isCampExpanded ? styles.drillToggleOpen : ''}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                          </div>
                        </td>
                        {visibleColumns.includes('objective') && (
                          <td className={styles.td}>
                            <span className={`${styles.tableBadge} ${isWeb ? styles.badgeWeb : styles.badgeMess}`}>
                              {isWeb ? '🌐 Website' : '💬 Messenger'}
                            </span>
                          </td>
                        )}
                        <td className={styles.td}>
                          <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{campaign.name}</div>
                        </td>
                        {visibleColumns.includes('spend') && (
                          <td className={styles.td} style={{ fontWeight: 500 }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(campaign.spend)}
                          </td>
                        )}
                        {visibleColumns.includes('cpa_cpm') && (
                          <td className={styles.td}>
                            <span className={`${styles.tableBadge} ${campaign.status === 'kill' ? styles.badgeBad : campaign.status === 'watch' ? styles.badgeWarn : styles.badgeGood}`}>
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(campaign.cpa)} {campaign.metricType}
                            </span>
                          </td>
                        )}
                        {visibleColumns.includes('performance') && (
                          <td className={styles.td}>
                            <span style={{ 
                              color: campaign.status === 'kill' ? 'var(--danger)' : campaign.status === 'watch' ? 'var(--warning)' : 'var(--success)', 
                              fontWeight: 600 
                            }}>
                              {campaign.performance}
                            </span>
                          </td>
                        )}
                        {visibleColumns.includes('status') && (
                          <td className={styles.td}>
                            <span className={`${styles.tableBadge} ${campaign.status === 'kill' ? styles.badgeBad : campaign.status === 'watch' ? styles.badgeWarn : styles.badgeGood}`}>
                              {campaign.statusLabel}
                            </span>
                          </td>
                        )}
                      </tr>

                      {/* Ad Sets (Child) Rows */}
                      {isCampExpanded && campaign.adSets.map((adSet: any) => {
                        const isAdSetExpanded = expandedAdSets.includes(adSet.id);
                        return (
                          <React.Fragment key={adSet.id}>
                            <tr 
                              className={styles.childRow}
                              onClick={() => toggleAdSet(adSet.id)}
                            >
                              <td className={styles.td} onClick={(e) => { e.stopPropagation(); toggleAdSet(adSet.id); }}>
                                <div 
                                  className={`${styles.drillToggle} ${isAdSetExpanded ? styles.drillToggleOpen : ''}`} 
                                  style={{ marginLeft: '12px' }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                                </div>
                              </td>
                              {visibleColumns.includes('objective') && (
                                <td className={styles.td}>
                                  <span className={styles.indentCell}>
                                    <span className={styles.connectorLine}>↳</span> Ad Set
                                  </span>
                                </td>
                              )}
                              <td className={styles.td} style={!visibleColumns.includes('objective') ? { paddingLeft: '40px' } : {}}>
                                <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{adSet.name}</div>
                              </td>
                              {visibleColumns.includes('spend') && (
                                <td className={styles.td}>
                                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(adSet.spend)}
                                </td>
                              )}
                              {visibleColumns.includes('cpa_cpm') && (
                                <td className={styles.td}>
                                  <span className={`${styles.tableBadge} ${campaign.status === 'kill' ? styles.badgeBad : styles.badgeGood}`}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(adSet.cpa)} {adSet.metricType}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.includes('performance') && (
                                <td className={styles.td}>
                                  <span style={{ color: campaign.status === 'kill' ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                                    {adSet.performance}
                                  </span>
                                </td>
                              )}
                              {visibleColumns.includes('status') && (
                                <td className={styles.td}>
                                  <span className={`${styles.tableBadge} ${adSet.status === 'paused' ? styles.badgeNeutral : styles.badgeGood}`}>
                                    {adSet.statusLabel}
                                  </span>
                                </td>
                              )}
                            </tr>

                            {/* Ads (Grand-child) Rows */}
                            {isAdSetExpanded && adSet.ads.map((ad: any) => {
                              return (
                                <tr key={ad.id} className={styles.grandChildRow}>
                                  <td className={styles.td}></td>
                                  {visibleColumns.includes('objective') && (
                                    <td className={styles.td}>
                                      <span className={styles.indentCell} style={{ marginLeft: '16px' }}>
                                        <span className={styles.connectorLine}>↳</span> Ad
                                      </span>
                                    </td>
                                  )}
                                  <td className={styles.td} style={!visibleColumns.includes('objective') ? { paddingLeft: '80px' } : { paddingLeft: '48px' }}>
                                    <div style={{ fontWeight: 400 }}>{ad.name}</div>
                                  </td>
                                  {visibleColumns.includes('spend') && (
                                    <td className={styles.td}>
                                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(ad.spend)}
                                    </td>
                                  )}
                                  {visibleColumns.includes('cpa_cpm') && (
                                    <td className={styles.td} style={{ color: 'var(--text-muted)' }}>
                                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(ad.cpa)} {ad.metricType}
                                    </td>
                                  )}
                                  {visibleColumns.includes('performance') && (
                                    <td className={styles.td}>
                                      <div style={{ fontWeight: 500 }}>{ad.performance}</div>
                                      {(ad as any).hookRate && <div className={styles.adHookDetail}>({(ad as any).hookRate})</div>}
                                    </td>
                                  )}
                                  {visibleColumns.includes('status') && (
                                    <td className={styles.td}>
                                      <span className={`${styles.tableBadge} ${ad.status === 'winning' ? styles.badgeGood : styles.badgeNeutral}`}>
                                        {ad.statusLabel}
                                      </span>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

