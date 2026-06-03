'use server';

import { getAdAccounts, getDashboardStats, getRealCampaignsData } from './dashboard';

export type InsightSeverity = 'danger' | 'warning' | 'success' | 'info';

export interface InsightMetric {
  label: string;
  value: string;
  tone?: InsightSeverity;
}

export interface InsightRecommendation {
  id: string;
  category: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  impact: string;
  metrics: InsightMetric[];
  actionLabel: string;
  actionHint: string;
}

export interface AiInsightsPayload {
  recommendations: InsightRecommendation[];
  summary: {
    spend: number;
    revenue: number;
    roas: string;
    ctr: string;
    purchase: number;
    source: 'real' | 'mixed' | 'mock';
  };
  accounts: Array<{ id: string; name?: string; account_id?: string }>;
}

interface CampaignLike {
  id: string;
  name: string;
  spend: number;
  cpa: number;
  cpm?: number;
  performance?: string;
  status?: string;
  statusLabel?: string;
  budget?: number;
  impressions?: number;
  conversions?: number;
  adSets?: Array<{
    name: string;
    spend: number;
    cpa: number;
    performance?: string;
    ads?: Array<{ name: string; spend: number; cpa: number; performance?: string; hookRate?: string; status?: string }>;
  }>;
}

export async function getAiInsightsAction(adAccountId: string = 'all'): Promise<{ success: boolean; data?: AiInsightsPayload; error?: string }> {
  try {
    const [accountsRes, statsRes, campaignsRes] = await Promise.all([
      getAdAccounts(),
      getDashboardStats('today', undefined, undefined, adAccountId),
      getRealCampaignsData(adAccountId),
    ]);

    const stats = statsRes.success ? statsRes.data : null;
    const campaigns = Array.isArray(campaignsRes.data) ? (campaignsRes.data as CampaignLike[]) : [];
    const recommendations = buildRecommendations(campaigns, stats);

    return {
      success: true,
      data: {
        recommendations,
        summary: {
          spend: Number(stats?.spend || 0),
          revenue: Number(stats?.revenue || 0),
          roas: String(stats?.roas || '0.00'),
          ctr: String(stats?.ctr || '0'),
          purchase: Number(stats?.purchase || 0),
          source: campaignsRes.isMock ? 'mock' : campaigns.length ? 'real' : 'mixed',
        },
        accounts: accountsRes.success ? accountsRes.data || [] : [],
      },
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Không thể tạo AI insights.' };
  }
}

function buildRecommendations(campaigns: CampaignLike[], stats: Record<string, unknown> | null): InsightRecommendation[] {
  if (!campaigns.length) return buildFallbackRecommendations(stats);

  const sortedBySpend = [...campaigns].sort((a, b) => Number(b.spend || 0) - Number(a.spend || 0));
  const scaleCandidate = campaigns
    .filter((campaign) => campaign.status === 'scale' || parseRoas(campaign.performance) >= 2.5)
    .sort((a, b) => parseRoas(b.performance) - parseRoas(a.performance))[0];
  const riskCandidate = campaigns
    .filter((campaign) => Number(campaign.spend || 0) > 0)
    .sort((a, b) => Number(b.cpa || 0) - Number(a.cpa || 0))[0];
  const heavySpend = sortedBySpend[0];

  const recommendations: InsightRecommendation[] = [];

  if (riskCandidate) {
    recommendations.push({
      id: 'risk-cpa',
      category: 'Cảnh báo chi phí',
      severity: 'danger',
      title: `Rủi ro CPA ở ${riskCandidate.name}`,
      description: `Campaign này đang có CPA ${formatMoney(riskCandidate.cpa)} với spend ${formatMoney(riskCandidate.spend)}. Cần kiểm tra ad set và creative đang đốt ngân sách trước khi tiếp tục scale.`,
      impact: 'Giảm lãng phí ngân sách',
      metrics: [
        { label: 'Spend', value: formatMoney(riskCandidate.spend) },
        { label: 'CPA', value: formatMoney(riskCandidate.cpa), tone: 'danger' },
        { label: 'Performance', value: riskCandidate.performance || 'Chưa có ROAS' },
      ],
      actionLabel: 'Review campaign',
      actionHint: 'Mở Campaign Management và kiểm tra ad set có CPA cao nhất.',
    });
  }

  if (scaleCandidate) {
    recommendations.push({
      id: 'scale-candidate',
      category: 'Cơ hội scale',
      severity: 'success',
      title: `Ứng viên scale: ${scaleCandidate.name}`,
      description: `Campaign này đang có performance ${scaleCandidate.performance || 'tốt'} và trạng thái ${scaleCandidate.statusLabel || 'active'}. Nên tăng ngân sách từng bước 20-30% để tránh reset learning quá mạnh.`,
      impact: 'Tiềm năng scale cao',
      metrics: [
        { label: 'Current budget', value: formatMoney((scaleCandidate.budget || 0) / 100) },
        { label: 'ROAS', value: scaleCandidate.performance || 'N/A', tone: 'success' },
        { label: 'Spend', value: formatMoney(scaleCandidate.spend) },
      ],
      actionLabel: 'Scale budget',
      actionHint: 'Tăng ngân sách 20-30% và theo dõi CPA trong 24h.',
    });
  }

  if (heavySpend) {
    recommendations.push({
      id: 'budget-focus',
      category: 'Trọng tâm ngân sách',
      severity: 'warning',
      title: `Spend lớn nhất: ${heavySpend.name}`,
      description: `Campaign này chiếm spend lớn nhất trong tập dữ liệu hiện tại. Nếu performance không vượt mức trung bình, cần ưu tiên tối ưu trước các campaign nhỏ hơn.`,
      impact: 'Kiểm soát ngân sách',
      metrics: [
        { label: 'Spend', value: formatMoney(heavySpend.spend), tone: 'warning' },
        { label: 'Impressions', value: formatNumber(heavySpend.impressions || 0) },
        { label: 'Conversions', value: formatNumber(heavySpend.conversions || 0) },
      ],
      actionLabel: 'Kiểm tra spend',
      actionHint: 'Kiểm tra ad set/ads có spend cao nhưng conversion thấp.',
    });
  }

  return recommendations.slice(0, 5);
}

function buildFallbackRecommendations(stats: Record<string, unknown> | null): InsightRecommendation[] {
  const spend = Number(stats?.spend || 0);
  const roas = String(stats?.roas || '0.00');
  const ctr = String(stats?.ctr || '0');

  return [
    {
      id: 'fallback-overview',
      category: 'Sức khỏe tài khoản',
      severity: Number(roas) >= 2 ? 'success' : 'warning',
      title: Number(roas) >= 2 ? 'Tài khoản đang vượt baseline ROAS' : 'Tài khoản cần dữ liệu cấp campaign',
      description: 'AI đã đọc dashboard stats, nhưng campaign detail chưa đủ để xếp hạng từng campaign. Hãy sync lại ad accounts nếu cần phân tích sâu hơn.',
      impact: 'Cần thêm dữ liệu',
      metrics: [
        { label: 'Spend today', value: formatMoney(spend) },
        { label: 'ROAS', value: `${roas}x` },
        { label: 'CTR', value: `${ctr}%` },
      ],
      actionLabel: 'Sync dữ liệu',
      actionHint: 'Đồng bộ lại tài khoản quảng cáo để có campaign/adset detail.',
    },
  ];
}

function parseRoas(value?: string) {
  if (!value) return 0;
  const match = value.match(/([\d.]+)x/i);
  return match ? Number(match[1]) : 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0);
}
