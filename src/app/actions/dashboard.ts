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
      
      return (data || []).reduce((acc, curr) => {
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
