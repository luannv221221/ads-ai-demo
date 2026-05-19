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
    return { success: false, error: error instanceof Error ? error.message : 'Khong the tao AI insights.' };
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
      category: 'Cost alert',
      severity: 'danger',
      title: `CPA risk in ${riskCandidate.name}`,
      description: `Campaign nay dang co CPA ${formatMoney(riskCandidate.cpa)} voi spend ${formatMoney(riskCandidate.spend)}. Can kiem tra ad set va creative dang dot ngan sach truoc khi tiep tuc scale.`,
      impact: 'Reduce wasted spend',
      metrics: [
        { label: 'Spend', value: formatMoney(riskCandidate.spend) },
        { label: 'CPA', value: formatMoney(riskCandidate.cpa), tone: 'danger' },
        { label: 'Performance', value: riskCandidate.performance || 'No ROAS' },
      ],
      actionLabel: 'Review campaign',
      actionHint: 'Mo Campaign Management va kiem tra ad set co CPA cao nhat.',
    });
  }

  if (scaleCandidate) {
    recommendations.push({
      id: 'scale-candidate',
      category: 'Scale opportunity',
      severity: 'success',
      title: `Scale candidate: ${scaleCandidate.name}`,
      description: `Campaign nay dang co performance ${scaleCandidate.performance || 'tot'} va trang thai ${scaleCandidate.statusLabel || 'active'}. Nen tang ngan sach tung buoc 20-30% de tranh lam reset learning qua manh.`,
      impact: 'High scale potential',
      metrics: [
        { label: 'Current budget', value: formatMoney((scaleCandidate.budget || 0) / 100) },
        { label: 'ROAS', value: scaleCandidate.performance || 'N/A', tone: 'success' },
        { label: 'Spend', value: formatMoney(scaleCandidate.spend) },
      ],
      actionLabel: 'Scale budget',
      actionHint: 'Tang ngan sach 20-30% va theo doi CPA trong 24h.',
    });
  }

  if (heavySpend) {
    recommendations.push({
      id: 'budget-focus',
      category: 'Budget focus',
      severity: 'warning',
      title: `Largest spend: ${heavySpend.name}`,
      description: `Campaign nay chiem spend lon nhat trong tap du lieu hien tai. Neu performance khong vuot muc trung binh, can uu tien toi uu truoc cac campaign nho hon.`,
      impact: 'Budget control',
      metrics: [
        { label: 'Spend', value: formatMoney(heavySpend.spend), tone: 'warning' },
        { label: 'Impressions', value: formatNumber(heavySpend.impressions || 0) },
        { label: 'Conversions', value: formatNumber(heavySpend.conversions || 0) },
      ],
      actionLabel: 'Inspect spend',
      actionHint: 'Kiem tra ad set/ads co spend cao nhung conversion thap.',
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
      category: 'Account health',
      severity: Number(roas) >= 2 ? 'success' : 'warning',
      title: Number(roas) >= 2 ? 'Account is above baseline ROAS' : 'Account needs campaign-level data',
      description: 'AI da doc dashboard stats, nhung campaign detail chua du de xep hang tung campaign. Hay sync lai ad accounts neu can phan tich sau hon.',
      impact: 'Needs more data',
      metrics: [
        { label: 'Spend today', value: formatMoney(spend) },
        { label: 'ROAS', value: `${roas}x` },
        { label: 'CTR', value: `${ctr}%` },
      ],
      actionLabel: 'Sync data',
      actionHint: 'Dong bo lai tai khoan quang cao de co campaign/adset detail.',
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
