'use server';

import { supabase } from '@/lib/supabase';

export async function getDashboardStats(range: string = 'today', startDate?: string, endDate?: string, adAccountId?: string) {
  try {
    
    // 1. Determine Current and Previous Periods
    let currentStart = '';
    let currentEnd = '';
    let prevStart = '';
    let prevEnd = '';

    if (range === 'custom' && startDate && endDate) {
      currentStart = startDate;
      currentEnd = endDate;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = end.getTime() - start.getTime();
      
      const pEnd = new Date(start.getTime() - 86400000); // 1 day before current start
      const pStart = new Date(pEnd.getTime() - diff);
      
      prevStart = pStart.toISOString().split('T')[0];
      prevEnd = pEnd.toISOString().split('T')[0];
    } else {
      currentStart = new Date().toISOString().split('T')[0];
      currentEnd = currentStart;
      
      const p = new Date();
      p.setDate(p.getDate() - 1);
      prevStart = p.toISOString().split('T')[0];
      prevEnd = prevStart;
    }

    // 2. Fetch Data for both periods
    const fetchStats = async (start: string, end: string) => {
      let query = supabase.from('daily_insights').select('*').gte('date', start).lte('date', end);
      
      if (adAccountId && adAccountId !== 'all') {
        query = query.eq('ad_account_id', adAccountId);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }
      
      console.log(`--- Fetching from ${start} to ${end} [Account: ${adAccountId || 'all'}]. Found ${data?.length || 0} rows. ---`);
      
      return (data || []).reduce((acc: any, curr: any) => {
        const results = typeof curr.results === 'string' ? JSON.parse(curr.results) : (curr.results || []);
        const getActionValue = (type: string) => {
          const action = results.find((a: any) => a.action_type === type);
          return action ? parseInt(action.value || 0) : 0;
        };

        return {
          spend: acc.spend + parseFloat(curr.spend || 0),
          impressions: acc.impressions + parseInt(curr.impressions || 0),
          clicks: acc.clicks + parseInt(curr.clicks || 0),
          reach: acc.reach + parseInt(curr.reach || 0),
          msgStarted: acc.msgStarted + getActionValue('onsite_conversion.messaging_conversation_started_7d'),
          addToCart: acc.addToCart + getActionValue('add_to_cart'),
          initiateCheckout: acc.initiateCheckout + getActionValue('initiate_checkout'),
          purchase: acc.purchase + getActionValue('purchase'),
          video3s: acc.video3s + getActionValue('video_view'),
          videoP50: acc.videoP50 + getActionValue('video_p50_watched_actions'),
          outboundClicks: acc.outboundClicks + getActionValue('outbound_click'),
        };
      }, { spend: 0, impressions: 0, clicks: 0, reach: 0, msgStarted: 0, addToCart: 0, initiateCheckout: 0, purchase: 0, video3s: 0, videoP50: 0, outboundClicks: 0 });
    };

    const currentStats = await fetchStats(currentStart, currentEnd);
    const prevStats = await fetchStats(prevStart, prevEnd);

    // Placeholder: 500k VND per purchase
    const AOV = 500000;
    const currentRevenue = currentStats.purchase * AOV;
    const prevRevenue = prevStats.purchase * AOV;
    const currentRoas = currentStats.spend > 0 ? (currentRevenue / currentStats.spend) : 0;
    const prevRoas = prevStats.spend > 0 ? (prevRevenue / prevStats.spend) : 0;

    // 3. Calculate Trends - Better handling of zero previous values
    const calcTrend = (curr: number, prev: number) => {
      if (!prev || prev === 0) return null;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const data = {
      ...currentStats,
      revenue: currentRevenue,
      roas: currentRoas.toFixed(2),
      ctr: currentStats.impressions > 0 ? ((currentStats.clicks / currentStats.impressions) * 100).toFixed(2) : 0,
      hookRate: currentStats.impressions > 0 ? ((currentStats.video3s / currentStats.impressions) * 100).toFixed(1) : 0,
      holdRate: currentStats.video3s > 0 ? ((currentStats.videoP50 / currentStats.video3s) * 100).toFixed(1) : 0,
      outboundCtr: currentStats.impressions > 0 ? ((currentStats.outboundClicks / currentStats.impressions) * 100).toFixed(1) : 0,
      trends: {
        spend: calcTrend(currentStats.spend, prevStats.spend),
        impressions: calcTrend(currentStats.impressions, prevStats.impressions),
        clicks: calcTrend(currentStats.clicks, prevStats.clicks),
        msgStarted: calcTrend(currentStats.msgStarted, prevStats.msgStarted),
        purchase: calcTrend(currentStats.purchase, prevStats.purchase),
        roas: calcTrend(currentRoas, prevRoas),
      }
    };

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: error.message };
  }
}

export async function getAdAccounts() {
  try {
    const { data, error } = await supabase
      .from('ad_accounts')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching ad accounts:', error);
    return { success: false, error: error.message };
  }
}

export async function getRealCampaignsData(adAccountId: string, startDate?: string, endDate?: string) {
  try {
    const accessToken = process.env.FB_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn('FB_ACCESS_TOKEN not set, falling back to mock.');
      return { success: true, data: null, isMock: true };
    }

    const FacebookAdsSDK = require('facebook-nodejs-business-sdk');
    const { FacebookAdsApi, AdAccount } = FacebookAdsSDK;
    FacebookAdsApi.init(accessToken);

    let targetAccountId = adAccountId;
    
    if (!targetAccountId || targetAccountId === 'all') {
      // Prioritize act_1145991459997754 (Mankai3) as the default account since it has rich campaign history
      targetAccountId = 'act_1145991459997754';
    }

    if (!targetAccountId.startsWith('act_')) {
      targetAccountId = 'act_' + targetAccountId;
    }

    console.log(`[getRealCampaignsData] Fetching for ${targetAccountId} with date range: ${startDate} to ${endDate}...`);
    const adAccount = new AdAccount(targetAccountId);
    
    let timeRangeStr = 'date_preset(last_90d)';
    if (startDate && endDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate) && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      timeRangeStr = `time_range({"since":"${startDate}","until":"${endDate}"})`;
    }

    const campaigns = await adAccount.getCampaigns([
      'id',
      'name',
      'objective',
      'status',
      'effective_status',
      'daily_budget',
      'lifetime_budget',
      `insights.${timeRangeStr}{spend,impressions,clicks,reach,cpm,actions}`,
      `adsets{id,name,status,effective_status,insights.${timeRangeStr}{spend,impressions,clicks,reach,cpm,actions},ads{id,name,status,effective_status,insights.${timeRangeStr}{spend,impressions,clicks,reach,cpm,actions}}}`
    ], {
      limit: 15
    });

    if (!campaigns || campaigns.length === 0) {
      console.log('No campaigns found for account, fallback to mock.');
      return { success: true, data: null, isMock: true };
    }

    const mappedCampaigns = campaigns.map((camp: any) => {
      const cData = camp._data;
      const cInsights = cData.insights?.data?.[0] || { spend: 0, impressions: 0, clicks: 0, reach: 0 };
      
      const getActionValue = (insightsObj: any, type: string) => {
        const actions = insightsObj.actions || [];
        const action = actions.find((a: any) => a.action_type === type);
        return action ? parseInt(action.value || 0) : 0;
      };

      const cSpend = parseFloat(cInsights.spend || 0);
      const cPurchases = getActionValue(cInsights, 'purchase');
      const cMsgs = getActionValue(cInsights, 'onsite_conversion.messaging_conversation_started_7d');
      const cObj = cData.objective?.toLowerCase() || 'website';
      const isWeb = cObj.includes('sales') || cObj.includes('conversions') || cObj.includes('website') || cObj.includes('leads');

      const cImps = parseInt(cInsights.impressions || 0);
      const cConvs = isWeb ? cPurchases : cMsgs;
      const cCpm = parseFloat(cInsights.cpm || (cImps > 0 ? (cSpend / cImps) * 1000 : 45000));

      let cCpa = 0;
      let cMetricType = 'CPA';
      let cPerf = '0x ROAS';
      
      if (isWeb) {
        cCpa = cPurchases > 0 ? cSpend / cPurchases : 0;
        const rev = cPurchases * 500000;
        const roas = cSpend > 0 ? (rev / cSpend) : 0;
        cPerf = roas > 0 ? `${roas.toFixed(1)}x ROAS` : '0.0x ROAS';
      } else {
        cCpa = cMsgs > 0 ? cSpend / cMsgs : 0;
        cMetricType = 'CPM';
        const rate = cMsgs > 0 && cInsights.clicks > 0 ? (cMsgs / cInsights.clicks) * 100 : 15;
        cPerf = `${rate.toFixed(1)}% Xin Số`;
      }

      let cStatus = 'watch';
      let cStatusLabel = 'Đang Theo Dõi';
      
      if (cData.status === 'ACTIVE' || cData.effective_status === 'ACTIVE') {
        if (isWeb) {
          const roasVal = cSpend > 0 ? (cPurchases * 500000 / cSpend) : 0;
          if (roasVal > 2.5) {
            cStatus = 'scale';
            cStatusLabel = 'Đang Vít (Scale)';
          } else if (roasVal > 1.2) {
            cStatus = 'active';
            cStatusLabel = 'Active';
          } else {
            cStatus = 'kill';
            cStatusLabel = 'Sắp Tắt (Kill)';
          }
        } else {
          cStatus = 'active';
          cStatusLabel = 'Active';
        }
      } else {
        cStatus = 'paused';
        cStatusLabel = 'Paused';
      }

      const adSetsData = cData.adsets?.data || [];
      const mappedAdSets = adSetsData.map((adset: any) => {
        const asInsights = adset.insights?.data?.[0] || { spend: 0, impressions: 0, clicks: 0 };
        const asSpend = parseFloat(asInsights.spend || 0);
        const asPurchases = getActionValue(asInsights, 'purchase');
        const asMsgs = getActionValue(asInsights, 'onsite_conversion.messaging_conversation_started_7d');
        
        let asCpa = 0;
        let asPerf = '0x ROAS';
        if (isWeb) {
          asCpa = asPurchases > 0 ? asSpend / asPurchases : 0;
          const roas = asSpend > 0 ? (asPurchases * 500000 / asSpend) : 0;
          asPerf = roas > 0 ? `${roas.toFixed(1)}x ROAS` : '0.0x ROAS';
        } else {
          asCpa = asMsgs > 0 ? asSpend / asMsgs : 0;
          const rate = asMsgs > 0 && asInsights.clicks > 0 ? (asMsgs / asInsights.clicks) * 100 : 15;
          asPerf = `${rate.toFixed(1)}% Xin Số`;
        }

        let asStatus = 'active';
        let asStatusLabel = 'Active';
        if (adset.status === 'PAUSED' || adset.effective_status === 'PAUSED') {
          asStatus = 'paused';
          asStatusLabel = 'Paused';
        }

        const adsData = adset.ads?.data || [];
        const mappedAds = adsData.map((ad: any) => {
          const adInsights = ad.insights?.data?.[0] || { spend: 0, impressions: 0, clicks: 0 };
          const adSpend = parseFloat(adInsights.spend || 0);
          const adPurchases = getActionValue(adInsights, 'purchase');
          const adMsgs = getActionValue(adInsights, 'onsite_conversion.messaging_conversation_started_7d');
          
          let adCpa = 0;
          let adPerf = '0x ROAS';
          if (isWeb) {
            adCpa = adPurchases > 0 ? adSpend / adPurchases : 0;
            const roas = adSpend > 0 ? (adPurchases * 500000 / adSpend) : 0;
            adPerf = roas > 0 ? `${roas.toFixed(1)}x ROAS` : '0.0x ROAS';
          } else {
            adCpa = adMsgs > 0 ? adSpend / adMsgs : 0;
            const rate = adMsgs > 0 && adInsights.clicks > 0 ? (adMsgs / adInsights.clicks) * 100 : 15;
            adPerf = `${rate.toFixed(1)}% Xin Số`;
          }

          let adStatus = 'active';
          let adStatusLabel = 'Active';
          if (ad.status === 'PAUSED' || ad.effective_status === 'PAUSED') {
            adStatus = 'paused';
            adStatusLabel = 'Paused';
          } else if (isWeb && adSpend > 0 && (adPurchases * 500000 / adSpend) > 3.0) {
            adStatus = 'winning';
            adStatusLabel = 'Winning';
          }

          const video3s = getActionValue(adInsights, 'video_view');
          const hook = adInsights.impressions > 0 ? (video3s / adInsights.impressions) * 100 : 25;

          return {
            id: ad.id,
            name: ad.name,
            spend: adSpend,
            cpa: adCpa,
            metricType: isWeb ? 'CPA' : 'CPM',
            performance: adPerf,
            hookRate: `Hook: ${hook.toFixed(0)}%`,
            status: adStatus,
            statusLabel: adStatusLabel
          };
        });

        return {
          id: adset.id,
          name: adset.name,
          spend: asSpend,
          cpa: asCpa,
          metricType: isWeb ? 'CPA' : 'CPM',
          performance: asPerf,
          status: asStatus,
          statusLabel: asStatusLabel,
          ads: mappedAds
        };
      });

      const cBudget = parseInt(cData.daily_budget || cData.lifetime_budget || 0);

      return {
        id: cData.id,
        name: cData.name,
        objective: isWeb ? 'website' : 'messenger',
        spend: cSpend,
        cpa: cCpa,
        cpm: cCpm,
        metricType: cMetricType,
        performance: cPerf,
        status: cStatus,
        statusLabel: cStatusLabel,
        budget: cBudget,
        impressions: cImps,
        conversions: cConvs,
        adSets: mappedAdSets
      };
    });

    return { success: true, data: mappedCampaigns, isMock: false };
  } catch (error: any) {
    console.error('Error fetching real campaigns data:', error);
    return { success: true, data: null, isMock: true, error: error.message };
  }
}

